import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useUI } from '../../store/useUI';
import { formatDateFull, renderStarLabel } from '../../lib/format';
import { PosterDisplay } from '../posters/PosterDisplay';
import { toPng } from 'html-to-image';
import { Download, Share2, X, Ticket, Film, Sparkles, Loader2, Heart } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { extractBase64Data, readImageBase64 } from '../../lib/imageStorage';
import { generateCardPngDataUrl } from '../../lib/cardCanvasRenderer';
import { GallerySave } from '../../lib/gallerySave';

export const TicketModal: React.FC = () => {
  const { ticketModalDayId, closeTicketModal, showToast } = useUI();
  const { days, profile } = useStore();
  const [styleMode, setStyleMode] = useState<'ticket' | 'poster'>('ticket');
  const [isExporting, setIsExporting] = useState(false);
  const [customPosterDataUri, setCustomPosterDataUri] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const day = (ticketModalDayId ? days.find((d) => d.id === ticketModalDayId) : null) || {
    id: ticketModalDayId || '',
    title: 'Untitled Day',
    rating: 4.5,
    isLiked: true,
    posterType: 'template' as const,
    posterTemplateId: 'mon' as const,
    dialogueQuote: '"Every day is an unrepeatable scene."',
    reviewText: '',
    genres: ['Slice of Life'],
    location: 'Earth',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Pre-load custom poster image as data URI to guarantee error-free canvas export
  useEffect(() => {
    let isMounted = true;
    if (day.posterType === 'custom' && day.posterImage) {
      if (
        day.posterImage.startsWith('data:') ||
        day.posterImage.startsWith('blob:') ||
        day.posterImage.startsWith('http')
      ) {
        setCustomPosterDataUri(day.posterImage);
      } else if (Capacitor.isNativePlatform()) {
        readImageBase64(day.posterImage).then((b64) => {
          if (isMounted && b64) {
            setCustomPosterDataUri(`data:image/jpeg;base64,${b64}`);
          }
        });
      } else {
        setCustomPosterDataUri(day.posterImage);
      }
    } else {
      setCustomPosterDataUri(null);
    }
    return () => {
      isMounted = false;
    };
  }, [day.posterType, day.posterImage]);

  if (!ticketModalDayId) return null;

  const generateCardDataUrl = async (): Promise<string> => {
    try {
      return await generateCardPngDataUrl(
        day,
        profile?.username || 'YOU',
        styleMode,
        customPosterDataUri
      );
    } catch (err) {
      console.warn('Canvas 2D render failed, falling back to toPng:', err);
      if (cardRef.current) {
        return await toPng(cardRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          cacheBust: false,
          skipFonts: true,
          backgroundColor: styleMode === 'ticket' ? '#1c222b' : '#14181c',
        });
      }
      throw err;
    }
  };

  const saveCardToNativeFilesystem = async (dataUrl: string, filename: string): Promise<string> => {
    const { base64 } = extractBase64Data(dataUrl);

    // Save to Cache directory for share provider access
    await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    });

    // Also persist a copy to Documents/Dayboxd for easy user access
    try {
      await Filesystem.writeFile({
        path: `Dayboxd/${filename}`,
        data: base64,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (e) {
      console.warn('Could not save duplicate to Documents:', e);
    }

    const { uri } = await Filesystem.getUri({
      path: filename,
      directory: Directory.Cache,
    });

    return uri;
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateCardDataUrl();
      const filename = `DayReel_${day.id}_${styleMode}.png`;

      if (Capacitor.isNativePlatform()) {
        // 1) Write PNG to app cache (for FileProvider URI)
        const { base64 } = extractBase64Data(dataUrl);
        await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Cache,
        });

        const { uri: cacheUri } = await Filesystem.getUri({
          path: filename,
          directory: Directory.Cache,
        });

        // 2) Save directly to device Gallery via MediaStore (no share sheet)
        try {
          await GallerySave.saveToGallery({
            filePath: cacheUri,
            fileName: filename,
          });
          showToast('✓ Saved to Gallery!', 'success');
        } catch (galleryErr) {
          console.warn('Gallery save failed, falling back to share sheet:', galleryErr);
          // Fallback to share sheet if native plugin call fails
          await Share.share({
            title: `Day Reel: ${day.title || day.id}`,
            text: `Dayboxd Cinema Card • ${formatDateFull(day.id)}`,
            url: cacheUri,
            dialogTitle: 'Save / Share Movie Card',
          });
          showToast('Movie card exported successfully!', 'success');
        }
      } else {
        // Web: trigger <a download>
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Cinema card exported successfully!', 'success');
      }
    } catch (err) {
      console.error('Export failed', err);
      showToast('Failed to export image', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateCardDataUrl();
      const filename = `DayReel_${day.id}_${styleMode}.png`;

      if (Capacitor.isNativePlatform()) {
        const uri = await saveCardToNativeFilesystem(dataUrl, filename);
        await Share.share({
          title: `Day Reel: ${day.title || day.id}`,
          text: `${day.title || 'Day Log'} — ${day.rating > 0 ? `${day.rating}★` : ''}\n${day.dialogueQuote || ''}`,
          url: uri,
          dialogTitle: 'Share your Day Reel',
        });
      } else {
        if (navigator.share) {
          try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], filename, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `Day Reel: ${day.title || day.id}`,
                text: `${day.title || 'Day Log'} — ${day.rating > 0 ? `${day.rating}★` : ''}`,
                files: [file],
              });
              return;
            }
          } catch (shareErr) {
            console.warn('Web share failed, falling back to download', shareErr);
          }
        }
        await handleDownload();
      }
    } catch (err) {
      console.error('Share failed', err);
      showToast('Failed to share image', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-theme-surface border border-theme-subtle rounded-2xl shadow-2xl overflow-hidden max-h-[86vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-theme-subtle bg-theme-surface shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00e054]" />
            <h3 className="text-sm font-bold text-theme-primary">Export Day Reel Card</h3>
          </div>
          <button
            onClick={closeTicketModal}
            className="p-1 text-theme-muted hover:text-theme-primary rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Style Selector Tabs */}
        <div className="flex items-center justify-center gap-2 p-2 bg-theme-elevated border-b border-theme-subtle shrink-0">
          <button
            onClick={() => setStyleMode('ticket')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              styleMode === 'ticket'
                ? 'bg-[#00e054] text-black shadow-md'
                : 'bg-theme-surface text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Vintage Cinema Ticket</span>
          </button>
          <button
            onClick={() => setStyleMode('poster')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              styleMode === 'poster'
                ? 'bg-[#00e054] text-black shadow-md'
                : 'bg-theme-surface text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Indie Film Poster</span>
          </button>
        </div>

        {/* Preview Container - Zoomed out and centered */}
        <div className="p-3 sm:p-4 flex items-center justify-center bg-[#0a0d11] overflow-y-auto flex-1 min-h-0">
          <div
            ref={cardRef}
            className="w-full max-w-[235px] sm:max-w-[260px] text-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 my-auto"
          >
            {styleMode === 'ticket' ? (
              /* VINTAGE CINEMA TICKET */
              <div className="bg-[#1c222b] border-2 border-dashed border-amber-500/40 p-3.5 sm:p-4 rounded-2xl relative select-none">
                {/* Perforated Notches */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0a0d11] border-r border-amber-500/40" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0a0d11] border-l border-amber-500/40" />

                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                  <div>
                    <span className="text-[8px] font-mono tracking-[0.2em] text-amber-400 uppercase font-bold">
                      ADMIT ONE • LIFE ARCHIVE
                    </span>
                    <div className="text-[11px] font-bold text-white tracking-wider font-sans">DAYBOXD</div>
                  </div>
                  <div className="text-[9px] font-mono text-neutral-400">№ {day.id.replace(/-/g, '')}</div>
                </div>

                <div className="flex gap-3 items-center mb-3">
                  <div className="w-16 h-22 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <PosterDisplay day={customPosterDataUri ? { ...day, posterImage: customPosterDataUri } : day} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-white leading-snug line-clamp-2">
                      {day.title || 'Untitled Feature'}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{formatDateFull(day.id)}</div>
                    {day.rating > 0 && (
                      <div className="text-[#00e054] font-bold text-xs mt-1 flex items-center gap-1">
                        <span>{renderStarLabel(day.rating)}</span>
                        {day.isLiked && <Heart className="w-3 h-3 fill-[#ff4d6d] text-[#ff4d6d] shrink-0 inline-block" />}
                      </div>
                    )}
                  </div>
                </div>

                {day.dialogueQuote && (
                  <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 mb-3 italic text-[11px] font-serif text-neutral-200 text-center line-clamp-2">
                    {day.dialogueQuote}
                  </div>
                )}

                <div className="border-t border-dashed border-white/10 pt-2 flex justify-between items-center text-[9px] font-mono text-neutral-400">
                  <span>LOC: {day.location || 'WORLD'}</span>
                  <span>DIRECTOR: {profile?.username || 'YOU'}</span>
                </div>
              </div>
            ) : (
              /* INDIE FILM 2:3 POSTER CARD */
              <div className="bg-[#14181c] border border-white/15 p-3 sm:p-3.5 rounded-2xl relative select-none flex flex-col">
                <div className="text-center mb-1.5">
                  <span className="text-[7.5px] font-mono tracking-[0.25em] text-[#00e054] uppercase font-bold">
                    A DAYBOXD ORIGINAL FEATURE
                  </span>
                </div>

                <div className="aspect-poster w-full rounded-xl overflow-hidden mb-2.5 border border-white/10 shadow-lg">
                  <PosterDisplay day={customPosterDataUri ? { ...day, posterImage: customPosterDataUri } : day} />
                </div>

                <div className="space-y-1 text-center">
                  <div className="text-xs sm:text-sm font-black font-sans tracking-tight text-white line-clamp-1">
                    {day.title || 'Untitled Day'}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">{formatDateFull(day.id)}</div>
                  {day.rating > 0 && (
                    <div className="text-[#00e054] text-xs font-extrabold flex items-center justify-center gap-1">
                      <span>{renderStarLabel(day.rating)}</span>
                      {day.isLiked && <Heart className="w-3 h-3 fill-[#ff4d6d] text-[#ff4d6d] shrink-0 inline-block" />}
                    </div>
                  )}
                  {day.dialogueQuote && (
                    <p className="text-[10px] font-serif italic text-neutral-300 px-1 line-clamp-2 mt-1">
                      {day.dialogueQuote}
                    </p>
                  )}
                </div>

                <div className="border-t border-white/10 pt-1.5 mt-2 flex justify-between text-[8px] font-mono text-neutral-400">
                  <span>GENRE: {day.genres?.[0] || 'DRAMA'}</span>
                  <span>STARRING: {profile?.username || 'SELF'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-theme-subtle bg-theme-surface shrink-0">
          <button
            type="button"
            onClick={closeTicketModal}
            className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:text-theme-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00e054] text-black font-bold text-xs hover:bg-[#00c030] shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isExporting ? 'Generating...' : 'Save Image'}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-theme-elevated text-theme-primary font-semibold text-xs hover:brightness-110 border border-theme-subtle transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5 text-[#40bcf4]" />}
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
