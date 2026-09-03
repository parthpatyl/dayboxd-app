import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { PosterDisplay } from '../components/posters/PosterDisplay';
import { Star, Edit3, Plus, X, Camera, Settings, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getCachedDisplayUrl } from '../lib/imageStorage';

export const Profile: React.FC = () => {
  const { profile, days, toggleFavoriteTopFour } = useStore();
  const navigate = useNavigate();

  const [pickerOpen, setPickerOpen] = useState(false);

  const topFourDays = (profile?.topFourDayIds || [])
    .map((id) => days.find((d) => d.id === id))
    .filter(Boolean);

  const ratedDays = days.filter((d) => d.rating > 0);
  const avgRating =
    ratedDays.length > 0
      ? (ratedDays.reduce((acc, d) => acc + d.rating, 0) / ratedDays.length).toFixed(1)
      : '—';

  const handleDayClick = (dayId: string) => {
    navigate(`/day/${dayId}`);
  };

  const renderAvatar = () => {
    const avatarSrc = getCachedDisplayUrl(profile?.avatarUrl);
    if (avatarSrc) {
      return (
        <img
          src={avatarSrc}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <span className="text-2xl font-bold font-sans text-theme-primary">
        {profile?.username ? profile.username.charAt(0).toUpperCase() : 'U'}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Profile Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-theme-surface border border-theme-subtle shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Clickable Profile Avatar */}
            <div
              onClick={() => navigate('/profile/edit')}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-theme-elevated border-2 border-theme-strong flex items-center justify-center overflow-hidden cursor-pointer group shadow-sm active:scale-95 transition-transform shrink-0"
              title="Edit Profile"
            >
              {renderAvatar()}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-theme-primary font-sans truncate">
                  {profile?.username || 'Cinephile'}
                </h1>
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-theme-elevated hover:brightness-110 border border-theme-subtle text-theme-primary text-xs font-semibold transition-all active:scale-95"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="p-2 rounded-xl bg-theme-elevated hover:brightness-110 border border-theme-subtle text-theme-secondary hover:text-theme-primary transition-transform active:scale-95 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Settings & Data Backup"
                  aria-label="Settings and Data Backup"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-theme-secondary font-serif italic max-w-md line-clamp-2">
                "{profile?.tagline || 'Life is a continuous 24fps unscripted film.'}"
              </p>
            </div>
          </div>

          {/* Quick Stats Counter */}
          <div className="flex items-center justify-around w-full sm:w-auto gap-4 sm:gap-6 bg-theme-elevated border border-theme-subtle px-4 py-2.5 rounded-2xl">
            <div className="text-center">
              <div className="text-base font-bold text-theme-primary font-sans">{days.length}</div>
              <div className="text-[10px] font-mono uppercase text-theme-muted font-bold">Logged</div>
            </div>
            <div className="h-5 w-[1px] bg-theme-subtle" />
            <div className="text-center">
              <div className="text-base font-bold text-theme-primary font-sans">
                {days.filter((d) => d.isLiked).length}
              </div>
              <div className="text-[10px] font-mono uppercase text-theme-muted font-bold">Liked</div>
            </div>
            <div className="h-5 w-[1px] bg-theme-subtle" />
            <div className="text-center">
              <div className="text-base font-bold text-[#ffcc00] font-sans">{avgRating}</div>
              <div className="text-[10px] font-mono uppercase text-theme-muted font-bold">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* ICONIC 'FAVORITE FOUR' PINBOARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#ffcc00] fill-[#ffcc00]" />
            <h2 className="text-base sm:text-lg font-bold text-theme-primary font-sans tracking-tight">
            Fantastic Four
            </h2>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-elevated border border-theme-subtle text-xs font-semibold text-theme-primary transition-all active:scale-95 shadow-xs whitespace-nowrap shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-theme-primary" />
            <span>Curate Top 4</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((slotIdx) => {
            const day = topFourDays[slotIdx];

            if (!day) {
              return (
                <button
                  key={slotIdx}
                  onClick={() => setPickerOpen(true)}
                  className="aspect-poster rounded-2xl border border-dashed border-theme-subtle hover:border-theme-strong bg-theme-surface/50 flex flex-col items-center justify-center gap-1.5 p-3 text-theme-muted hover:text-theme-primary transition-all group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono font-medium">Slot {slotIdx + 1}</span>
                </button>
              );
            }

            return (
              <div
                key={day.id}
                onClick={() => handleDayClick(day.id)}
                className="group relative cursor-pointer flex flex-col space-y-1.5 transition-transform duration-150 active:scale-[0.98]"
              >
                <div className="relative aspect-poster w-full rounded-2xl overflow-hidden shadow-xs border border-theme-subtle group-hover:border-theme-strong transition-all bg-black">
                  <PosterDisplay day={day} className="w-full h-full object-cover" />
                </div>

                <div className="px-1 space-y-0.5">
                  <div className="text-xs sm:text-sm font-bold text-theme-primary truncate font-sans">
                    {day.title || day.id}
                  </div>
                  <div className="text-xs font-mono text-theme-muted flex items-center justify-between">
                    <span className="font-bold text-theme-secondary">#{slotIdx + 1}</span>
                    <span className="text-[#ffcc00] font-bold">★ {day.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings & Data Backup Row */}
      <div className="pt-2">
        <Link
          to="/settings"
          className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle hover:border-theme-strong transition-all flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-elevated text-theme-primary border border-theme-subtle">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-theme-primary font-sans">Settings & Data Backup</h3>
              <p className="text-xs text-theme-muted font-mono">Daily reminders, theme tokens & JSON vault</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Curate Top 4 Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-theme-surface border border-theme-subtle rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-theme-subtle">
              <h3 className="text-sm sm:text-base font-bold text-theme-primary font-sans">Curate Favorite 4</h3>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-1.5 rounded-xl text-theme-muted hover:text-theme-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2">
              <p className="text-xs text-theme-muted font-mono">
                Tap any day to toggle its pinned status in your Favorite 4 Criterion Collection.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {days.map((day) => {
                  const isTop4 = profile?.topFourDayIds.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      onClick={() => toggleFavoriteTopFour(day.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all active:scale-98 ${
                        isTop4
                          ? 'border-theme-primary bg-theme-elevated ring-1 ring-white/20'
                          : 'border-theme-subtle bg-theme-input hover:border-theme-strong'
                      }`}
                    >
                      <div className="w-11 aspect-poster rounded-lg overflow-hidden shrink-0 border border-theme-subtle bg-black">
                        <PosterDisplay day={day} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-theme-primary truncate font-sans">
                          {day.title || 'Untitled'}
                        </div>
                        <div className="text-xs font-mono text-theme-muted">{day.id}</div>
                        <div className="text-xs font-mono text-[#ffcc00] font-bold">
                           {day.rating.toFixed(1)}
                        </div>
                      </div>
                      {isTop4 && <Star className="w-4 h-4 text-[#ffcc00] fill-[#ffcc00] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-theme-subtle bg-theme-surface">
              <button
                onClick={() => setPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-theme-primary text-theme-primary border border-theme-subtle font-semibold text-xs sm:text-sm active:scale-95 shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
