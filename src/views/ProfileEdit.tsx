import React, { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { useUI } from '../store/useUI';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Check } from 'lucide-react';
import { saveImageToFilesystem, getCachedDisplayUrl } from '../lib/imageStorage';

export const ProfileEdit: React.FC = () => {
  const { profile, updateProfile } = useStore();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState(profile?.username || '');
  const [tagline, setTagline] = useState(profile?.tagline || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile?.avatarUrl);
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'zoom'>('cover');
  const [isGif, setIsGif] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAnimatedGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    setIsGif(isAnimatedGif);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalAvatarPath = avatarUrl;
      if (avatarUrl && avatarUrl.startsWith('data:image/')) {
        const { storagePath } = await saveImageToFilesystem(
          avatarUrl,
          'avatar',
          username.trim() || 'user'
        );
        finalAvatarPath = storagePath;
      }

      await updateProfile({
        username: username.trim() || 'Cinephile',
        tagline: tagline.trim(),
        avatarUrl: finalAvatarPath || undefined,
      });
      showToast('Profile updated successfully!', 'success');
      navigate('/profile');
    } catch (err) {
      console.error('Failed to update profile', err);
      showToast('Error saving profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getFitStyle = () => {
    if (fitMode === 'contain') return 'object-contain scale-90';
    if (fitMode === 'zoom') return 'object-cover scale-125';
    return 'object-cover';
  };

  const displayAvatarPreview = getCachedDisplayUrl(avatarUrl) || avatarUrl;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 max-w-xl mx-auto px-1 sm:px-0">
      {/* Header Bar with Back Button */}
      <div className="flex items-center justify-between border-b border-theme-subtle pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/profile')}
            className="p-1.5 rounded-lg border border-theme-subtle bg-theme-elevated hover:brightness-110 text-theme-primary transition-all active:scale-95"
            title="Back to Profile"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-theme-primary font-sans tracking-tight">
              Edit Profile
            </h1>
            <p className="text-[10px] font-mono text-theme-muted">
              Account identity, avatar photo, and bio
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Edit Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar Photo / GIF Management Card */}
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle space-y-4 shadow-xs">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-theme-muted font-bold">
            Profile Photo / Animated GIF
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Circular Avatar Preview */}
            <div className="relative w-24 h-24 rounded-full border-2 border-theme-strong bg-theme-elevated flex items-center justify-center overflow-hidden shadow-md shrink-0">
              {displayAvatarPreview ? (
                <img
                  src={displayAvatarPreview}
                  alt="Avatar Preview"
                  className={`w-full h-full transition-transform duration-200 ${getFitStyle()}`}
                />
              ) : (
                <span className="text-3xl font-bold font-sans text-theme-primary">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-elevated hover:brightness-110 border border-theme-subtle text-theme-primary text-xs font-semibold transition-all active:scale-95 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{avatarUrl ? 'Change Image / GIF' : 'Upload Image or GIF'}</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(undefined)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Fit & Zoom Pill Modes */}
              {avatarUrl && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-theme-muted">Fit:</span>
                  <div className="flex items-center gap-1 bg-theme-input border border-theme-subtle rounded-lg p-0.5 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setFitMode('cover')}
                      className={`px-2 py-0.5 rounded transition-all ${
                        fitMode === 'cover'
                          ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                          : 'text-theme-muted hover:text-theme-primary'
                      }`}
                    >
                      Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode('contain')}
                      className={`px-2 py-0.5 rounded transition-all ${
                        fitMode === 'contain'
                          ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                          : 'text-theme-muted hover:text-theme-primary'
                      }`}
                    >
                      Fit
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode('zoom')}
                      className={`px-2 py-0.5 rounded transition-all ${
                        fitMode === 'zoom'
                          ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                          : 'text-theme-muted hover:text-theme-primary'
                      }`}
                    >
                      Zoom
                    </button>
                  </div>
                  {isGif && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[8px] font-mono font-bold">
                      GIF
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Display Name & Tagline Fields Card */}
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle space-y-3.5 shadow-xs">
          {/* Display Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-theme-muted font-bold">
                Display Name
              </label>
              <span className="text-[9px] font-mono text-theme-muted">{username.length}/40</span>
            </div>
            <input
              type="text"
              maxLength={40}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. CinephileOfLife"
              className="w-full h-9 px-3 rounded-xl bg-theme-input border border-theme-subtle text-theme-primary placeholder:text-theme-muted text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-theme-primary"
              required
            />
          </div>

          {/* Tagline / Bio */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-theme-muted font-bold">
                Tagline / Bio
              </label>
              <span className="text-[9px] font-mono text-theme-muted">{tagline.length}/120</span>
            </div>
            <textarea
              rows={3}
              maxLength={120}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Life is a continuous 24fps unscripted film..."
              className="w-full p-2.5 rounded-xl bg-theme-input border border-theme-subtle text-xs sm:text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Save & Cancel Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-3.5 py-1.5 rounded-xl text-xs text-theme-muted hover:text-theme-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-theme-primary text-theme-primary border border-theme-subtle font-semibold text-xs hover:bg-theme-elevated transition-all active:scale-95 shadow-xs disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
