import React, { useRef } from 'react';
import { DayOfWeekId } from '../../types';
import { DayTemplatePoster } from './DayTemplates';
import { Upload, Sparkles, X } from 'lucide-react';
import { saveImageToFilesystem, getCachedDisplayUrl } from '../../lib/imageStorage';

interface PosterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: 'custom' | 'template';
  currentTemplateId: DayOfWeekId;
  currentImage?: string | null;
  onSelectTemplate: (templateId: DayOfWeekId) => void;
  onUploadImage: (imageUri: string) => void;
}

const TEMPLATES: { id: DayOfWeekId; label: string; vibe: string }[] = [
  { id: 'mon', label: 'Monday', vibe: 'The Opening Scene' },
  { id: 'tue', label: 'Tuesday', vibe: 'Steady Momentum' },
  { id: 'wed', label: 'Wednesday', vibe: 'Midpoint Twist' },
  { id: 'thu', label: 'Thursday', vibe: 'Rising Action' },
  { id: 'fri', label: 'Friday', vibe: 'The Climax (Neon)' },
  { id: 'sat', label: 'Saturday', vibe: 'Golden Hour 35mm' },
  { id: 'sun', label: 'Sunday', vibe: 'The End Credits' },
];

export const PosterSelectorModal: React.FC<PosterSelectorModalProps> = ({
  isOpen,
  onClose,
  currentType,
  currentTemplateId,
  currentImage,
  onSelectTemplate,
  onUploadImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        const { storagePath } = await saveImageToFilesystem(
          dataUri,
          'poster',
          currentTemplateId || 'custom'
        );
        onUploadImage(storagePath);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-backdrop-fade">
      <div className="relative w-full max-w-2xl bg-theme-surface border border-theme-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-subtle">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00e054]" />
            <h3 className="text-lg font-bold text-theme-primary font-sans">Choose Day Poster</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-elevated transition-micro active:scale-[0.92]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Upload Photo Option */}
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-theme-muted mb-2">
              Custom Camera Roll / Photo
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-theme-subtle bg-theme-input hover:bg-theme-elevated hover:border-[#00e054]/50 text-theme-primary font-medium text-sm transition-press active:scale-[0.98]"
              >
                <Upload className="w-4 h-4 text-[#00e054]" />
                <span>Upload From Device / Camera</span>
              </button>
              {currentType === 'custom' && currentImage && (
                <div className="w-14 h-20 rounded-lg overflow-hidden border border-[#00e054] relative shadow-xs">
                  <img src={getCachedDisplayUrl(currentImage) || currentImage} alt="Current" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* 7 Day-of-Week Cinema Vector Templates */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-mono tracking-wider uppercase text-theme-muted">
                Or Select 7-Day Cinematic Template
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TEMPLATES.map((t) => {
                const isSelected = currentType === 'template' && currentTemplateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelectTemplate(t.id);
                      onClose();
                    }}
                    className={`group relative flex flex-col rounded-xl overflow-hidden border transition-press active:scale-[0.96] text-left ${
                      isSelected
                        ? 'border-[#00e054] ring-2 ring-[#00e054]/30'
                        : 'border-theme-subtle hover:border-theme-strong'
                    }`}
                  >
                    <div className="aspect-poster w-full">
                      <DayTemplatePoster dayOfWeek={t.id} />
                    </div>
                    <div className="p-2 bg-theme-input w-full border-t border-theme-subtle">
                      <div className="text-xs font-bold text-theme-primary">{t.label}</div>
                      <div className="text-[10px] text-theme-muted truncate">{t.vibe}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
