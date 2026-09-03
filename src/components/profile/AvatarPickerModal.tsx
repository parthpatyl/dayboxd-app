import React, { useRef, useState } from 'react';
import { X, Upload, Trash2, Sparkles } from 'lucide-react';
import { saveImageToFilesystem, getCachedDisplayUrl } from '../../lib/imageStorage';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onUploadCustom: (dataUrl: string) => void;
  onRemoveAvatar: () => void;
  username: string;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  onUploadCustom,
  onRemoveAvatar,
  username,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatarUrl);
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'zoom'>('cover');
  const [isGif, setIsGif] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAnimatedGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
    setIsGif(isAnimatedGif);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (previewUrl) {
      if (previewUrl.startsWith('data:image/')) {
        const { storagePath } = await saveImageToFilesystem(
          previewUrl,
          'avatar',
          username.trim() || 'user'
        );
        onUploadCustom(storagePath);
      } else {
        onUploadCustom(previewUrl);
      }
    }
    onClose();
  };

  const getFitStyle = () => {
    if (fitMode === 'contain') {
      return 'object-contain scale-90';
    }
    if (fitMode === 'zoom') {
      return 'object-cover scale-125';
    }
    return 'object-cover'; // cover
  };

  const displayPreview = getCachedDisplayUrl(previewUrl) || previewUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xs sm:max-w-sm bg-theme-surface border border-theme-subtle rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-theme-subtle">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-theme-secondary" />
            <h3 className="text-sm font-bold text-theme-primary">Profile Avatar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-theme-muted hover:text-theme-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Circular Avatar Preview with Fit Mode Controls */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative w-24 h-24 rounded-full border-2 border-theme-strong bg-theme-elevated flex items-center justify-center overflow-hidden shadow-lg">
              {displayPreview ? (
                <img
                  src={displayPreview}
                  alt="Avatar Preview"
                  className={`w-full h-full transition-transform duration-200 ${getFitStyle()}`}
                />
              ) : (
                <span className="text-3xl font-bold font-sans text-theme-primary">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            {/* GIF Badge or Fit Selector */}
            {previewUrl && (
              <div className="flex items-center gap-1.5 text-xs">
                {isGif && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold">
                    GIF PLAYBACK
                  </span>
                )}
                {/* Fit Mode Switcher */}
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
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-theme-input border border-theme-subtle hover:border-theme-strong text-theme-primary text-xs font-semibold transition-all active:scale-98 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{previewUrl ? 'Choose Different Photo / GIF' : 'Upload Photo or Animated GIF'}</span>
            </button>
          </div>

          {/* Reset / Remove Button */}
          {previewUrl && (
            <button
              onClick={() => {
                setPreviewUrl(undefined);
                onRemoveAvatar();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove Photo (Reset to Initial Monogram)</span>
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-subtle">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-theme-muted hover:text-theme-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-theme-primary text-theme-primary border border-theme-subtle font-semibold text-xs active:scale-95 shadow-xs"
            >
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
