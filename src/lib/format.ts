import { format, parseISO, isValid, getDay } from 'date-fns';
import { DayOfWeekId } from '../types';

export function formatDateFull(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'EEEE, MMMM d, yyyy') : dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, 'MMM d, yyyy') : dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDayAndMonth(dateStr: string): { day: string; month: string; year: string; weekday: string } {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return { day: '', month: '', year: '', weekday: '' };
    return {
      day: format(d, 'd'),
      month: format(d, 'MMM'),
      year: format(d, 'yyyy'),
      weekday: format(d, 'EEE'),
    };
  } catch {
    return { day: '', month: '', year: '', weekday: '' };
  }
}

export function getDayOfWeekTemplateId(dateStr: string): DayOfWeekId {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return 'mon';
    const dayNum = getDay(d); // 0 = Sunday, 1 = Monday, etc.
    const map: Record<number, DayOfWeekId> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };
    return map[dayNum] || 'mon';
  } catch {
    return 'mon';
  }
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getCurrentTimeString(): string {
  return format(new Date(), 'h:mm a');
}

export function renderStarLabel(rating: number): string {
  if (!rating || rating <= 0) return 'Unrated';
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  let s = '★'.repeat(fullStars);
  if (hasHalf) s += '½';
  return s;
}
