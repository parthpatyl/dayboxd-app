import React from 'react';
import { useStore } from '../../store/useStore';
import { Sun, Moon, Settings as SettingsIcon } from 'lucide-react';
import { getTodayString } from '../../lib/format';
import { getCachedDisplayUrl } from '../../lib/imageStorage';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { profile, updateProfile, setActiveDayId } = useStore();
  const todayStr = getTodayString();

  const toggleTheme = () => {
    const nextTheme = profile?.theme === 'light' ? 'dark' : 'light';
    updateProfile({ theme: nextTheme });
  };

  const renderAvatarMini = () => {
    const avatarSrc = getCachedDisplayUrl(profile?.avatarUrl);
    if (avatarSrc) {
      return <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />;
    }
    return (
      <span className="text-xs font-bold text-theme-primary font-sans">
        {profile?.username ? profile.username.charAt(0).toUpperCase() : 'U'}
      </span>
    );
  };

  return (
    <header className="w-full border-b border-theme-subtle bg-theme-surface pt-safe select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 h-14 sm:h-15 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          onClick={() => setActiveDayId(todayStr)}
          className="flex items-center gap-2.5 group active:scale-95 transition-transform"
        >
          <img 
            src="/app-icon.png" 
            alt="Dayboxd" 
            className="w-8 h-8 object-contain" 
          />
          <span className="font-extrabold tracking-tight text-theme-primary text-sm sm:text-base font-sans">
            DAYBOXD
          </span>
        </Link>

        {/* Right Action Controls: Theme Toggle, Settings, & Profile */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${profile?.theme === 'light' ? 'dark' : 'light'} theme`}
            className="p-2.5 rounded-xl border border-theme-subtle bg-theme-elevated hover:brightness-110 text-theme-secondary hover:text-theme-primary transition-transform active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Toggle Light/Dark Theme"
          >
            {profile?.theme === 'light' ? (
              <Moon className="w-4 h-4 text-theme-primary" />
            ) : (
              <Sun className="w-4 h-4 text-theme-primary" />
            )}
          </button>

          {/* Settings & Reminders Link */}
          <Link
            to="/settings"
            aria-label="Settings and Reminders"
            className="p-2.5 rounded-xl border border-theme-subtle bg-theme-elevated hover:brightness-110 text-theme-secondary hover:text-theme-primary transition-transform active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 text-theme-primary" />
          </Link>

          {/* Profile Avatar Button */}
          <Link
            to="/profile"
            aria-label="View user profile"
            className="w-9 h-9 rounded-full bg-theme-elevated border-2 border-theme-strong flex items-center justify-center overflow-hidden hover:brightness-110 transition-transform active:scale-95 shadow-xs"
            title="View Profile"
          >
            {renderAvatarMini()}
          </Link>
        </div>
      </div>
    </header>
  );
};
