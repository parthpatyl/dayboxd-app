import React, { useRef } from 'react';
import { DayOfWeekId } from '../../types';
import { DayTemplatePoster } from './DayTemplates';
import { Upload, Sparkles, X } from 'lucide-react';
import { saveImageToFilesystem } from '../../lib/imageStorage';

interface PosterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType: 'custom' | 'template';
  currentTemplateId: DayOfWeekId;
  currentImage?: string | null;
  onSelectTemplate: (templateId: DayOfWeekId) => void;
  onUploadImage: (imageUri: string) => void;
}

const TEMPLATES: { id: DayOfWeekId; label: string; index: string }[] = [
  { id: 'mon', label: 'Monday', index: '№ 01' },
  { id: 'tue', label: 'Tuesday', index: '№ 02' },
  { id: 'wed', label: 'Wednesday', index: '№ 03' },
  { id: 'thu', label: 'Thursday', index: '№ 04' },
  { id: 'fri', label: 'Friday', index: '№ 05' },
  { id: 'sat', label: 'Saturday', index: '№ 06' },
  { id: 'sun', label: 'Sunday', index: '№ 07' },
];

export const PosterSelectorModal: React.FC<PosterSelectorModalProps> = ({
  isOpen,
  onClose,
  currentType,
  currentTemplateId,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-theme-surface rounded-2xl border border-theme-subtle shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-subtle">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-theme-primary">Choose Day Poster</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-theme-muted hover:text-theme-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Custom Upload Option */}
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-theme-muted uppercase mb-3">
              Custom Camera Roll / Photo
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-theme-strong hover:border-accent text-theme-primary font-bold text-sm bg-theme-input/50 hover:bg-theme-input transition-all"
            >
              <Upload className="w-4 h-4 text-accent" />
              Upload From Device / Camera
            </button>
          </div>

          {/* 7-Day Templates */}
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-theme-muted uppercase mb-3">
              Or Select 7-Day Template
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
                    <div className="py-2.5 px-3 bg-theme-input w-full border-t border-theme-subtle flex items-center justify-between">
                      <div className="text-sm font-bold text-theme-primary">{t.label}</div>
                      <div className="text-[11px] font-mono text-theme-muted font-semibold">{t.index}</div>
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
