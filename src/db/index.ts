import Dexie, { type Table } from 'dexie';
import { DayLog, Scene, UserProfile } from '../types';

export class JournalDatabase extends Dexie {
  days!: Table<DayLog, string>;
  scenes!: Table<Scene, string>;
  profile!: Table<UserProfile, string>;

  constructor() {
    super('LetterboxdForDaysDB');
    this.version(1).stores({
      days: '&id, rating, isLiked, createdAt, updatedAt',
      scenes: '&id, dayId, createdAt',
      profile: '&id',
    });
  }
}

export const db = new JournalDatabase();

/**
 * Initializes database with clean slate:
 * 0 days, 0 scenes, and clean default profile.
 */
export async function initDatabase(): Promise<void> {
  const profileCount = await db.profile.count();
  if (profileCount === 0) {
    const defaultProfile: UserProfile = {
      id: 'default_user',
      username: 'Cinephile',
      tagline: '',
      topFourDayIds: [],
      theme: 'dark',
      reminderEnabled: true,
      reminderTime: '21:00',
      createdAt: new Date().toISOString(),
    };
    await db.profile.add(defaultProfile);
  }
}

/**
 * Full Clean Slate Reset:
 * Completely clears all days, scenes, and resets profile to default.
 */
export async function resetEntireDatabase(): Promise<void> {
  await db.days.clear();
  await db.scenes.clear();
  await db.profile.clear();
  await initDatabase();
}
