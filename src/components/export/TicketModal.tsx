import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useUI } from '../../store/useUI';
import { formatDateFull, renderStarLabel } from '../../lib/format';
import { PosterDisplay } from '../posters/PosterDisplay';
import { toPng } from 'html-to-image';
import { Download, Share2, X, Ticket, Film, Sparkles, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { extractBase64Data, readImageBase64 } from '../../lib/imageStorage';

export const TicketModal: React.FC = () => {
  const { ticketModalDayId, closeTicketModal, showToast } = useUI();
  const { days, profile } = useStore();
  const [styleMode, setStyleMode] = useState<'ticket' | 'poster'>('ticket');
  const [isExporting, setIsExporting] = useState(false);
  const [customPosterDataUri, setCustomPosterDataUri] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!ticketModalDayId) return null;

  const day = days.find((d) => d.id === ticketModalDayId) || {
    id: ticketModalDayId,
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

  const generateCardDataUrl = async (node: HTMLElement): Promise<string> => {
    try {
      return await toPng(node, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: false,
        skipFonts: false,
        backgroundColor: styleMode === 'ticket' ? '#1c222b' : '#14181c',
      });
    } catch (err) {
      console.warn('Initial toPng failed, retrying with skipFonts fallback:', err);
      return await toPng(node, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: false,
        skipFonts: true,
        backgroundColor: styleMode === 'ticket' ? '#1c222b' : '#14181c',
      });
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

    // Also persist a copy to Documents/Dayboxd for easy file access
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
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await generateCardDataUrl(cardRef.current);
      const filename = `DayReel_${day.id}_${styleMode}.png`;

      if (Capacitor.isNativePlatform()) {
        const uri = await saveCardToNativeFilesystem(dataUrl, filename);
        await Share.share({
          title: `Day Reel: ${day.title || day.id}`,
          text: `Dayboxd Cinema Card • ${formatDateFull(day.id)}`,
          url: uri,
          dialogTitle: 'Save / Share Movie Card',
        });
        showToast('Movie card exported successfully!', 'success');
      } else {
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
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await generateCardDataUrl(cardRef.current);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-theme-surface border border-theme-subtle rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme-subtle bg-theme-surface">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00e054]" />
            <h3 className="text-base font-bold text-theme-primary">Export Day Reel Card</h3>
          </div>
          <button
            onClick={closeTicketModal}
            className="p-1 text-theme-muted hover:text-theme-primary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selector Tabs */}
        <div className="flex items-center justify-center gap-2 p-3 bg-theme-elevated border-b border-theme-subtle">
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

        {/* Preview Container */}
        <div className="p-6 flex justify-center bg-[#0d1014] overflow-hidden">
          <div
            ref={cardRef}
            className="w-full max-w-[340px] text-white shadow-2xl rounded-2xl overflow-hidden"
          >
            {styleMode === 'ticket' ? (
              /* VINTAGE CINEMA TICKET */
              <div className="bg-[#1c222b] border-2 border-dashed border-amber-500/40 p-5 rounded-2xl relative select-none">
                {/* Perforated Notches */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0d1014] border-r border-amber-500/40" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0d1014] border-l border-amber-500/40" />

                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <div>
                    <span className="text-[9px] font-mono tracking-[0.25em] text-amber-400 uppercase font-bold">
                      ADMIT ONE • LIFE ARCHIVE
                    </span>
                    <div className="text-xs font-bold text-white tracking-wider font-sans">DAYBOXD</div>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">№ {day.id.replace(/-/g, '')}</div>
                </div>

                <div className="flex gap-4 items-center mb-4">
                  <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <PosterDisplay day={customPosterDataUri ? { ...day, posterImage: customPosterDataUri } : day} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-white leading-snug line-clamp-2">
                      {day.title || 'Untitled Feature'}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">{formatDateFull(day.id)}</div>
                    {day.rating > 0 && (
                      <div className="text-[#00e054] font-bold text-sm mt-1.5 flex items-center gap-1">
                        <span>{renderStarLabel(day.rating)}</span>
                        {day.isLiked && <span className="text-[#ff4d6d]">♥</span>}
                      </div>
                    )}
                  </div>
                </div>

                {day.dialogueQuote && (
                  <div className="bg-black/30 border border-white/5 rounded-xl p-3 mb-4 italic text-xs font-serif text-neutral-200 text-center">
                    {day.dialogueQuote}
                  </div>
                )}

                <div className="border-t border-dashed border-white/10 pt-3 flex justify-between items-center text-[10px] font-mono text-neutral-400">
                  <span>LOC: {day.location || 'WORLD'}</span>
                  <span>DIRECTOR: {profile?.username || 'YOU'}</span>
                </div>
              </div>
            ) : (
              /* INDIE FILM 2:3 POSTER CARD */
              <div className="bg-[#14181c] border border-white/15 p-4 rounded-2xl relative select-none flex flex-col justify-between">
                <div className="text-center mb-2">
                  <span className="text-[8px] font-mono tracking-[0.3em] text-[#00e054] uppercase font-bold">
                    A DAYBOXD ORIGINAL FEATURE
                  </span>
                </div>

                <div className="aspect-poster w-full rounded-xl overflow-hidden mb-3 border border-white/10 shadow-lg">
                  <PosterDisplay day={customPosterDataUri ? { ...day, posterImage: customPosterDataUri } : day} />
                </div>

                <div className="space-y-1.5 text-center">
                  <div className="text-base font-black font-sans tracking-tight text-white line-clamp-1">
                    {day.title || 'Untitled Day'}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">{formatDateFull(day.id)}</div>
                  {day.rating > 0 && (
                    <div className="text-[#00e054] text-base font-extrabold flex items-center justify-center gap-1.5">
                      <span>{renderStarLabel(day.rating)}</span>
                      {day.isLiked && <span className="text-[#ff4d6d]">♥</span>}
                    </div>
                  )}
                  {day.dialogueQuote && (
                    <p className="text-xs font-serif italic text-neutral-300 px-2 line-clamp-2 mt-2">
                      {day.dialogueQuote}
                    </p>
                  )}
                </div>

                <div className="border-t border-white/10 pt-2 mt-3 flex justify-between text-[9px] font-mono text-neutral-400">
                  <span>GENRE: {day.genres?.[0] || 'DRAMA'}</span>
                  <span>STARRING: {profile?.username || 'SELF'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-theme-subtle bg-theme-surface">
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
