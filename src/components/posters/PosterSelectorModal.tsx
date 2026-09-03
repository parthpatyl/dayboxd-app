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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#1f242d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00e054]" />
            <h3 className="text-lg font-bold text-white font-sans">Choose Day Poster</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Upload Photo Option */}
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-2">
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
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-[#00e054]/50 text-white font-medium text-sm transition-all"
              >
                <Upload className="w-4 h-4 text-[#00e054]" />
                <span>Upload From Device / Camera</span>
              </button>
              {currentType === 'custom' && currentImage && (
                <div className="w-14 h-20 rounded-lg overflow-hidden border border-[#00e054] relative">
                  <img src={getCachedDisplayUrl(currentImage) || currentImage} alt="Current" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* 7 Day-of-Week Cinema Vector Templates */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-mono tracking-wider uppercase text-neutral-400">
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
                    className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all text-left ${
                      isSelected
                        ? 'border-[#00e054] ring-2 ring-[#00e054]/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="aspect-poster w-full">
                      <DayTemplatePoster dayOfWeek={t.id} />
                    </div>
                    <div className="p-2 bg-[#14181c] w-full border-t border-white/5">
                      <div className="text-xs font-bold text-white">{t.label}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{t.vibe}</div>
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
