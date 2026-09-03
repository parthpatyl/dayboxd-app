import { create } from 'zustand';
import { db, initDatabase, resetEntireDatabase } from '../db';
import { DayLog, Scene, UserProfile, FilterState } from '../types';
import { getTodayString, getDayOfWeekTemplateId } from '../lib/format';
import { mirrorStateToFilesystem } from '../lib/storageSafety';
import { syncStatusBarTheme } from '../lib/statusBar';
import {
  deleteImageFromFilesystem,
  migrateLegacyBase64Images,
  preCacheAllImages,
  purgeAllStorageImages,
} from '../lib/imageStorage';

const initialFilter: FilterState = {
  searchQuery: '',
  selectedGenre: null,
  likedOnly: false,
  minRating: 0,
  year: null,
  month: null,
  sortMode: 'date-desc',
};

interface StoreState {
  profile: UserProfile | null;
  days: DayLog[];
  scenes: Scene[];
  activeDayId: string;
  filter: FilterState;
  isInitialized: boolean;

  // Actions
  init: () => Promise<void>;
  setActiveDayId: (id: string) => void;
  saveDay: (dayData: Partial<DayLog> & { id: string }) => Promise<DayLog>;
  deleteDay: (id: string) => Promise<void>;
  addScene: (sceneData: { dayId: string; time: string; content: string; location?: string; mood?: string }) => Promise<Scene>;
  updateScene: (id: string, updates: Partial<Scene>) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  toggleFavoriteTopFour: (dayId: string) => Promise<void>;
  setFilter: (updates: Partial<FilterState>) => void;
  resetFilter: () => void;
  importFullBackup: (jsonObj: any) => Promise<boolean>;
  resetSanctuary: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  profile: null,
  days: [],
  scenes: [],
  activeDayId: getTodayString(),
  filter: initialFilter,
  isInitialized: false,

  init: async () => {
    // One-time automatic clean slate reset on first launch of this build
    const CLEAN_SLATE_KEY = 'letterboxd_clean_slate_v2';
    if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
      await resetEntireDatabase();
      await purgeAllStorageImages();
      localStorage.setItem(CLEAN_SLATE_KEY, 'true');
    } else {
      await initDatabase();
      // Silent background migration of any legacy base64 images
      await migrateLegacyBase64Images();
    }

    const [profile, days, scenes] = await Promise.all([
      db.profile.get('default_user'),
      db.days.toArray(),
      db.scenes.toArray(),
    ]);

    // Pre-cache all filesystem image webview URLs for instantaneous rendering
    await preCacheAllImages([
      profile?.avatarUrl,
      ...days.map((d) => d.posterImage),
    ]);

    // Apply saved theme to DOM and native status bar
    const savedTheme = profile?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    await syncStatusBarTheme(savedTheme);

    set({
      profile: profile || null,
      days: days.sort((a, b) => b.id.localeCompare(a.id)),
      scenes: scenes.sort((a, b) => a.time.localeCompare(b.time)),
      isInitialized: true,
    });
  },

  setActiveDayId: (id: string) => set({ activeDayId: id }),

  saveDay: async (dayData) => {
    const existing = await db.days.get(dayData.id);
    const now = new Date().toISOString();

    // If poster changed, clean up previous custom image file
    if (
      existing?.posterImage &&
      dayData.posterImage !== undefined &&
      existing.posterImage !== dayData.posterImage
    ) {
      deleteImageFromFilesystem(existing.posterImage);
    }

    const fullDay: DayLog = {
      id: dayData.id,
      title: dayData.title ?? existing?.title ?? '',
      rating: dayData.rating ?? existing?.rating ?? 0,
      isLiked: dayData.isLiked ?? existing?.isLiked ?? false,
      posterType: dayData.posterType ?? existing?.posterType ?? 'template',
      posterImage: dayData.posterImage !== undefined ? dayData.posterImage : (existing?.posterImage ?? null),
      posterTemplateId: dayData.posterTemplateId ?? existing?.posterTemplateId ?? getDayOfWeekTemplateId(dayData.id),
      dialogueQuote: dayData.dialogueQuote ?? existing?.dialogueQuote ?? '',
      reviewText: dayData.reviewText ?? existing?.reviewText ?? '',
      genres: dayData.genres ?? existing?.genres ?? [],
      location: dayData.location ?? existing?.location ?? '',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await db.days.put(fullDay);

    const updatedDays = await db.days.toArray();
    set({ days: updatedDays.sort((a, b) => b.id.localeCompare(a.id)) });

    // Mirror to filesystem if native
    const { profile, scenes } = get();
    mirrorStateToFilesystem({
      version: 1,
      exportedAt: now,
      profile,
      days: updatedDays,
      scenes,
    });

    return fullDay;
  },

  deleteDay: async (id: string) => {
    const dayToDelete = await db.days.get(id);
    if (dayToDelete?.posterImage) {
      deleteImageFromFilesystem(dayToDelete.posterImage);
    }

    await db.days.delete(id);
    await db.scenes.where('dayId').equals(id).delete();
    
    // Also remove from top 4 if present
    const profile = get().profile;
    if (profile && profile.topFourDayIds.includes(id)) {
      const updatedTop4 = profile.topFourDayIds.filter((dId) => dId !== id);
      await get().updateProfile({ topFourDayIds: updatedTop4 });
    }

    const [updatedDays, updatedScenes] = await Promise.all([
      db.days.toArray(),
      db.scenes.toArray(),
    ]);

    set({
      days: updatedDays.sort((a, b) => b.id.localeCompare(a.id)),
      scenes: updatedScenes,
    });
  },

  addScene: async (sceneData) => {
    const newScene: Scene = {
      id: 'scene_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      dayId: sceneData.dayId,
      time: sceneData.time,
      content: sceneData.content,
      location: sceneData.location,
      mood: sceneData.mood,
      createdAt: new Date().toISOString(),
    };

    await db.scenes.add(newScene);
    const allScenes = await db.scenes.toArray();
    set({ scenes: allScenes.sort((a, b) => a.time.localeCompare(b.time)) });
    return newScene;
  },

  updateScene: async (id: string, updates: Partial<Scene>) => {
    await db.scenes.update(id, updates);
    const allScenes = await db.scenes.toArray();
    set({ scenes: allScenes.sort((a, b) => a.time.localeCompare(b.time)) });
  },

  deleteScene: async (id: string) => {
    await db.scenes.delete(id);
    const allScenes = await db.scenes.toArray();
    set({ scenes: allScenes.sort((a, b) => a.time.localeCompare(b.time)) });
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    if (!current) return;

    if (
      current.avatarUrl &&
      updates.avatarUrl !== undefined &&
      current.avatarUrl !== updates.avatarUrl
    ) {
      deleteImageFromFilesystem(current.avatarUrl);
    }

    const updated: UserProfile = { ...current, ...updates };
    await db.profile.put(updated);
    
    if (updates.theme) {
      document.documentElement.setAttribute('data-theme', updates.theme);
      await syncStatusBarTheme(updates.theme);
    }

    set({ profile: updated });
  },

  toggleFavoriteTopFour: async (dayId: string) => {
    const profile = get().profile;
    if (!profile) return;

    let top4 = [...profile.topFourDayIds];
    if (top4.includes(dayId)) {
      top4 = top4.filter((id) => id !== dayId);
    } else {
      if (top4.length >= 4) {
        top4 = [...top4.slice(1), dayId];
      } else {
        top4.push(dayId);
      }
    }

    await get().updateProfile({ topFourDayIds: top4 });
  },

  setFilter: (updates) => {
    set((state) => ({
      filter: { ...state.filter, ...updates },
    }));
  },

  resetFilter: () => {
    set({ filter: initialFilter });
  },

  importFullBackup: async (jsonObj: any) => {
    try {
      if (!jsonObj || typeof jsonObj !== 'object') return false;

      // Require at least profile and days (scenes can be empty)
      if (!jsonObj.profile || typeof jsonObj.profile !== 'object') return false;
      if (!Array.isArray(jsonObj.days)) return false;

      // Enforce primary key so Dexie can find it on next init()
      if (jsonObj.profile.id !== 'default_user') {
        jsonObj.profile.id = 'default_user';
      }

      // Write profile
      await db.profile.put(jsonObj.profile);

      // Overwrite days (clear first to avoid stale orphans)
      await db.days.clear();
      if (jsonObj.days.length > 0) {
        await db.days.bulkPut(jsonObj.days);
      }

      // Overwrite scenes
      await db.scenes.clear();
      if (Array.isArray(jsonObj.scenes) && jsonObj.scenes.length > 0) {
        await db.scenes.bulkPut(jsonObj.scenes);
      }

      // Re-initialize store from DB and re-apply theme / status bar
      await get().init();
      return true;
    } catch (err) {
      console.error('Failed to import backup:', err);
      return false;
    }
  },

  resetSanctuary: async () => {
    try {
      await resetEntireDatabase();
      await purgeAllStorageImages();
      await get().init();
    } catch (err) {
      console.error('Failed to reset sanctuary:', err);
    }
  },
}));
