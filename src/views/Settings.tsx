import React, { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { useUI } from '../store/useUI';
import {
  exportZipArchive,
  downloadMarkdownFile,
  parseBackupFile,
} from '../lib/storageSafety';
import {
  DEFAULT_REMINDER_PHASES,
  scheduleAllJournalReminders,
} from '../lib/notifications';
import { Switch } from '../components/ui/switch';
import { formatDateFull, renderStarLabel } from '../lib/format';

export const Settings: React.FC = () => {
  const { profile, days, scenes, updateProfile, importFullBackup } = useStore();
  const { showToast } = useUI();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(
    profile?.reminderEnabled ?? true
  );
  const [reminderTime, setReminderTime] = useState<string>(
    profile?.reminderTime || '21:00'
  );

  const handleToggleTheme = (theme: 'dark' | 'light') => {
    updateProfile({ theme });
    showToast(`Theme switched to ${theme === 'dark' ? 'Cinema Dark' : 'Editorial Light'}`);
  };

  const handleReminderToggle = async (enabled: boolean) => {
    setReminderEnabled(enabled);
    await updateProfile({ reminderEnabled: enabled });
    await scheduleAllJournalReminders(enabled, DEFAULT_REMINDER_PHASES, {
      enabled,
      time: reminderTime,
      message: "Time to log today's film entry and rate your day.",
    });
    showToast(enabled ? 'Daily Journal Reminder activated!' : 'Journal reminders disabled');
  };

  const handleReminderTimeChange = async (time: string) => {
    setReminderTime(time);
    await updateProfile({ reminderTime: time });
    if (reminderEnabled) {
      await scheduleAllJournalReminders(true, DEFAULT_REMINDER_PHASES, {
        enabled: true,
        time,
        message: "Time to log today's film entry and rate your day.",
      });
    }
  };

  const handleExportZip = async () => {
    try {
      const payload = {
        app: 'Dayboxd',
        version: 1,
        exportedAt: new Date().toISOString(),
        profile,
        days,
        scenes,
      };
      const filename = `Dayboxd_Archive_${new Date().toISOString().split('T')[0]}.zip`;
      await exportZipArchive(payload, filename);
      showToast('Backup archive (.zip) ready — save it from the share sheet', 'success');
    } catch (err) {
      console.error('Export Zip failed:', err);
      showToast('Export failed — please try again', 'error');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-imported if needed
    e.target.value = '';

    try {
      const payload = await parseBackupFile(file);
      if (!payload) {
        showToast('Could not read backup file', 'error');
        return;
      }

      // Enforce profile ID so Dexie stores it under the correct primary key
      if (payload.profile && payload.profile.id !== 'default_user') {
        payload.profile.id = 'default_user';
      }

      const success = await importFullBackup(payload);
      if (success) {
        showToast('Data sanctuary restored successfully!', 'success');
      } else {
        showToast('Invalid backup file structure', 'error');
      }
    } catch (err) {
      console.error('Import parse error:', err);
      showToast('Failed to parse backup file — file may be corrupt', 'error');
    }
  };

  const handleExportMarkdown = async () => {
    try {
      let md = `# 🎬 Dayboxd — Life Archive\n\n`;
      md += `*Exported on ${new Date().toLocaleDateString()} for ${profile?.username || 'Cinephile'}*\n\n---\n\n`;

      days.forEach((d) => {
        md += `## ${formatDateFull(d.id)}: ${d.title || 'Untitled Day'}\n\n`;
        if (d.rating > 0) {
          md += `**Rating:** ${renderStarLabel(d.rating)} ${d.isLiked ? '♥ (Liked)' : ''}\n\n`;
        }
        if (d.genres.length > 0) {
          md += `**Genres/Moods:** ${d.genres.join(', ')}\n\n`;
        }
        if (d.location) {
          md += `**Location:** ${d.location}\n\n`;
        }
        if (d.dialogueQuote) {
          md += `> *${d.dialogueQuote}*\n\n`;
        }
        if (d.reviewText) {
          md += `### Evening Synopsis\n${d.reviewText}\n\n`;
        }

        const dayScenes = scenes.filter((s) => s.dayId === d.id);
        if (dayScenes.length > 0) {
          md += `### Recorded Scenes\n`;
          dayScenes.forEach((s) => {
            md += `- **${s.time}** ${s.location ? `(${s.location})` : ''}: ${s.content}\n`;
          });
          md += `\n`;
        }
        md += `---\n\n`;
      });

      const filename = `Dayboxd_Archive_${new Date().toISOString().split('T')[0]}.md`;
      await downloadMarkdownFile(md, filename);
      showToast('Markdown archive ready — save it from the share sheet', 'success');
    } catch (err) {
      console.error('Export Markdown failed:', err);
      showToast('Export failed — please try again', 'error');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-theme-subtle pb-3">
        <h1 className="text-lg sm:text-xl font-bold text-theme-primary font-sans tracking-tight">Sanctuary & Settings</h1>
        <p className="text-[11px] font-mono text-theme-muted mt-0.5">
          Privacy controls, local backup management, and preferences
        </p>
      </div>

      {/* Theme Settings Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-3 shadow-xs">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-theme-primary">Aesthetic Theme</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => handleToggleTheme('dark')}
            className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
              profile?.theme !== 'light'
                ? 'border-theme-primary bg-theme-elevated text-theme-primary ring-1 ring-white/20'
                : 'border-theme-subtle bg-theme-input text-theme-muted hover:border-theme-strong'
            }`}
          >
            <div className="text-xs font-semibold text-theme-primary">Cinema Dark</div>
            <div className="text-[10px] text-theme-muted">Pure Pitch Black & Subtle Gray</div>
          </button>

          <button
            onClick={() => handleToggleTheme('light')}
            className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
              profile?.theme === 'light'
                ? 'border-theme-primary bg-theme-elevated text-theme-primary ring-1 ring-black/20'
                : 'border-theme-subtle bg-theme-input text-theme-muted hover:border-theme-strong'
            }`}
          >
            <div className="text-xs font-semibold text-theme-primary">Editorial Light</div>
            <div className="text-[10px] text-theme-muted">Clean Crisp Paper</div>
          </button>
        </div>
      </div>

      {/* Daily Journal Reminder (Time Picker Only) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
          <div className="space-y-0.5">
            <h2 className="text-xs sm:text-sm font-bold text-theme-primary">
              Daily Journal Reminder
            </h2>
            <p className="text-[11px] text-theme-muted font-mono">
              Daily prompt to log your film entry and rate your reel
            </p>
          </div>
          <Switch
            checked={reminderEnabled}
            onCheckedChange={handleReminderToggle}
          />
        </div>

        <div className={`transition-opacity duration-200 ${reminderEnabled ? 'opacity-100' : 'opacity-60'}`}>
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] font-mono text-theme-muted uppercase font-bold">
              Trigger Time:
            </span>
            <input
              type="time"
              value={reminderTime}
              disabled={!reminderEnabled}
              onChange={(e) => handleReminderTimeChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-theme-elevated border border-theme-subtle text-xs font-mono font-bold text-theme-primary focus:ring-1 focus:ring-theme-primary outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* 100% Private Local Data Sanctuary */}
      <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-3 shadow-xs">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-theme-primary">Data Sanctuary & Ownership</h2>
        </div>
        <p className="text-[11px] text-theme-muted leading-relaxed">
          Your thoughts and days are 100% private. All logs and custom photos are stored locally on your device. Export complete archives (.zip) or restore anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Zip Backup Download */}
          <button
            type="button"
            onClick={handleExportZip}
            className="flex items-center justify-center p-2.5 rounded-xl bg-theme-elevated hover:brightness-110 border border-theme-subtle text-xs font-semibold text-theme-primary transition-all shadow-xs active:scale-95 text-center"
            title="Export complete backup archive with all photos"
          >
            <span>Backup (.zip)</span>
          </button>

          {/* Backup Restore */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".zip,.json,application/zip,application/json"
            onChange={handleImportBackup}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center p-2.5 rounded-xl bg-theme-elevated hover:brightness-110 border border-theme-subtle text-xs font-semibold text-theme-primary transition-all shadow-xs active:scale-95 text-center"
            title="Restore from .zip archive or .json backup"
          >
            <span>Restore Backup</span>
          </button>

          {/* Markdown Diary Book Export */}
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="flex items-center justify-center p-2.5 rounded-xl bg-theme-elevated hover:brightness-110 border border-theme-subtle text-xs font-semibold text-theme-primary transition-all shadow-xs active:scale-95 text-center"
            title="Export diary entries as a clean Markdown reading book"
          >
            <span>Markdown Book</span>
          </button>
        </div>

        {/* Clean Slate Reset */}
        <div className="pt-2 border-t border-theme-subtle flex items-center justify-between">
          <span className="text-[10px] font-mono text-theme-muted">
            Want to start over with 0 entries?
          </span>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to reset your sanctuary to a clean slate? All days and images will be permanently erased.')) {
                await useStore.getState().resetSanctuary();
                showToast('Sanctuary reset to clean slate', 'success');
              }
            }}
            className="text-[11px] font-mono text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Reset Clean Slate
          </button>
        </div>
      </div>
    </div>
  );
};
