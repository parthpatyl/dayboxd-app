import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ReminderPhaseSchedule } from '../types';

const CHANNEL_ID = 'journal_reminders';

export interface ZenPhaseConfig {
  key: keyof ReminderPhaseSchedule;
  id: number;
  icon: string;
  name: string;
  subtitle: string;
  title: string;
  body: string;
  defaultTime: string;
  image: string;
}

export const ZEN_PHASES: ZenPhaseConfig[] = [
  {
    key: 'morning',
    id: 101,
    icon: '🌅',
    name: 'Morning',
    subtitle: 'Opening Scene',
    title: '🎬 Dayboxd • Morning',
    body: 'Frame your opening scene. What is the tone of this morning?',
    defaultTime: '09:00',
    image: '/stills/morning.jpg',
  },
  {
    key: 'afternoon',
    id: 102,
    icon: '☀️',
    name: 'Afternoon',
    subtitle: 'Midday Intermission',
    title: '🎬 Dayboxd • Afternoon',
    body: 'Capture a moment. Record a line of dialogue or a midday thought.',
    defaultTime: '14:00',
    image: '/stills/afternoon.jpg',
  },
  {
    key: 'evening',
    id: 103,
    icon: '🌇',
    name: 'Evening',
    subtitle: 'Golden Hour',
    title: '🎬 Dayboxd • Evening',
    body: 'Golden hour approaches. What dialogue or scene defined today?',
    defaultTime: '19:00',
    image: '/stills/evening.jpg',
  },
  {
    key: 'night',
    id: 104,
    icon: '🌙',
    name: 'Night Wrap',
    subtitle: 'Closing Credits',
    title: '🎬 Dayboxd • Night Wrap',
    body: 'The final cut is in. Give today its star rating and close the reel.',
    defaultTime: '22:30',
    image: '/stills/night.jpg',
  },
];

export const DEFAULT_REMINDER_PHASES: ReminderPhaseSchedule = {
  morning: { enabled: true, time: '09:00' },
  afternoon: { enabled: true, time: '14:00' },
  evening: { enabled: true, time: '19:00' },
  night: { enabled: true, time: '22:30' },
};

export async function ensureNotificationChannel() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Daily Journal Reminders',
      description: 'Cinematic reminders to frame scenes, log quotes, and rate your daily film',
      importance: 5, // High importance (heads-up popup banner)
      visibility: 1,
      vibration: true,
      lights: true,
    });
  } catch (err) {
    console.warn('Could not create notification channel:', err);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  try {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export async function scheduleAllJournalReminders(
  masterEnabled: boolean,
  phases: ReminderPhaseSchedule = DEFAULT_REMINDER_PHASES,
  customSchedule?: { enabled: boolean; time: string; message?: string }
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Web reminder state updated:', { masterEnabled, phases, customSchedule });
    return true;
  }

  try {
    await ensureNotificationChannel();
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    // Cancel all existing scheduled phase notifications and custom reminder
    const allIds = [...ZEN_PHASES.map((p) => ({ id: p.id })), { id: 500 }];
    await LocalNotifications.cancel({ notifications: allIds });

    if (!masterEnabled) return true;

    const notificationsToSchedule: any[] = ZEN_PHASES.filter(
      (phase) => phases[phase.key]?.enabled
    ).map((phase) => {
      const timeStr = phases[phase.key]?.time || phase.defaultTime;
      const [hoursStr, minsStr] = timeStr.split(':');
      const hours = parseInt(hoursStr, 10) || 12;
      const mins = parseInt(minsStr, 10) || 0;

      return {
        id: phase.id,
        channelId: CHANNEL_ID,
        title: phase.title,
        body: phase.body,
        summaryText: phase.subtitle,
        largeIcon: phase.key,
        iconColor: '#ffcc00',
        schedule: {
          on: {
            hour: hours,
            minute: mins,
          },
          repeats: true,
          allowWhileIdle: true,
        },
        smallIcon: 'ic_launcher_round',
        extra: { type: 'journal_phase_reminder', phase: phase.key },
      };
    });

    // 5th Slot: Custom Daily Reminder (Text-only, user-specified time)
    if (customSchedule?.enabled) {
      const customTime = customSchedule.time || '21:00';
      const [cHoursStr, cMinsStr] = customTime.split(':');
      const cHours = parseInt(cHoursStr, 10) || 21;
      const cMins = parseInt(cMinsStr, 10) || 0;
      const customText = customSchedule.message?.trim() || "Time to log today's film entry and rate your day.";

      notificationsToSchedule.push({
        id: 500,
        channelId: CHANNEL_ID,
        title: '🎬 Letterboxd for Days • Daily Reminder',
        body: customText,
        summaryText: 'Daily Journal',
        largeBody: customText,
        iconColor: '#ffcc00',
        schedule: {
          on: {
            hour: cHours,
            minute: cMins,
          },
          repeats: true,
          allowWhileIdle: true,
        },
        smallIcon: 'ic_launcher_round',
        extra: { type: 'custom_journal_reminder' },
      });
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule,
      });
    }

    return true;
  } catch (err) {
    console.error('Failed to schedule journal reminders:', err);
    return false;
  }
}

export async function sendTestPhaseNotification(phaseKey: keyof ReminderPhaseSchedule): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log(`Web test notification fired for phase: ${phaseKey}`);
    return true;
  }

  try {
    await ensureNotificationChannel();
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    const phase = ZEN_PHASES.find((p) => p.key === phaseKey) || ZEN_PHASES[0];
    const triggerAt = new Date(Date.now() + 2000);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 990 + phase.id,
          channelId: CHANNEL_ID,
          title: phase.title,
          body: phase.body,
          summaryText: phase.subtitle,
          largeIcon: phase.key,
          iconColor: '#ffcc00',
          schedule: {
            at: triggerAt,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_launcher_round',
          extra: { type: 'test_phase_notification', phase: phase.key },
        },
      ],
    });
    return true;
  } catch (err) {
    console.error('Failed to send test phase notification:', err);
    return false;
  }
}

export async function sendTestCustomReminder(message?: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Web test custom reminder fired:', message);
    return true;
  }

  try {
    await ensureNotificationChannel();
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    const triggerAt = new Date(Date.now() + 2000);
    const text = message?.trim() || "Time to log today's film entry and rate your day.";

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 995,
          channelId: CHANNEL_ID,
          title: '🎬 Letterboxd for Days • Daily Reminder',
          body: text,
          summaryText: 'Daily Journal',
          largeBody: text,
          iconColor: '#ffcc00',
          schedule: {
            at: triggerAt,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_launcher_round',
          extra: { type: 'test_custom_reminder' },
        },
      ],
    });
    return true;
  } catch (err) {
    console.error('Failed to send test custom reminder:', err);
    return false;
  }
}

// Backward compatibility legacy wrapper
export async function scheduleDailyJournalReminder(enabled: boolean, timeStr: string): Promise<boolean> {
  return scheduleAllJournalReminders(enabled, {
    ...DEFAULT_REMINDER_PHASES,
    night: { enabled, time: timeStr },
  });
}

export async function sendImmediateTestNotification(): Promise<boolean> {
  return sendTestPhaseNotification('night');
}
