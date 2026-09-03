export type DayOfWeekId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayLog {
  id: string; // Format: 'YYYY-MM-DD'
  title: string;
  rating: number; // 0.0 to 5.0 (steps of 0.5; 0 = unrated)
  isLiked: boolean;
  posterType: 'custom' | 'template';
  posterImage?: string | null; // Data URI / Blob storage
  posterTemplateId: DayOfWeekId;
  dialogueQuote: string;
  reviewText: string;
  genres: string[];
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  dayId: string; // References DayLog.id ('YYYY-MM-DD')
  time: string; // '10:30' (24-hour time for native input) or '10:30 AM'
  content: string;
  location?: string;
  mood?: string;
  createdAt: string;
}

export interface ReminderPhaseSchedule {
  morning: { enabled: boolean; time: string };
  afternoon: { enabled: boolean; time: string };
  evening: { enabled: boolean; time: string };
  night: { enabled: boolean; time: string };
}

export interface UserProfile {
  id: string;
  username: string;
  tagline: string;
  avatarUrl?: string; // Custom Base64 uploaded photo
  avatarPreset?: string; // e.g. 'clapper', 'camera', 'chair', 'lens'
  topFourDayIds: string[]; // up to 4 DayLog IDs
  theme: 'dark' | 'light';
  reminderEnabled: boolean;
  reminderTime: string; // '21:00' (legacy fallback)
  reminderPhases?: ReminderPhaseSchedule;
  customReminderEnabled?: boolean;
  customReminderTime?: string; // '21:00'
  customReminderMessage?: string;
  createdAt: string;
}

export type SortMode = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';

export interface FilterState {
  searchQuery: string;
  selectedGenre: string | null;
  likedOnly: boolean;
  minRating: number;
  year: number | null;
  month: number | null;
  sortMode: SortMode;
}

export const GENRE_OPTIONS = [
  'Slice of Life',
  'Comedy',
  'Drama',
  'Sci-Fi / Work',
  'Action / Busy',
  'Melancholic',
  'Euphoric',
  'Romance',
  'Mystery',
  'Quiet / Peace',
];
