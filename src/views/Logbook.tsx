import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useUI } from '../store/useUI';
import { formatDateShort, getTodayString, getDayOfWeekTemplateId } from '../lib/format';
import { StarRating } from '../components/ui/StarRating';
import { LikedHeart } from '../components/ui/LikedHeart';
import { PosterDisplay } from '../components/posters/PosterDisplay';
import { PosterSelectorModal } from '../components/posters/PosterSelectorModal';
import { TimePickerSegmented } from '../components/ui/TimePickerSegmented';
import { CalendarPickerModal } from '../components/ui/CalendarPickerModal';
import { GENRE_OPTIONS, Scene } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Ticket,
  Quote,
  ChevronLeft,
  ChevronRight,
  Camera,
  Edit2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { addDays, subDays, parseISO, format, isValid } from 'date-fns';

const TITLE_MAX_LENGTH = 80;
const DIALOGUE_MAX_LENGTH = 160;
const REVIEW_MAX_LENGTH = 2000;
const SCENE_MAX_LENGTH = 300;

const get24HourTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const Logbook: React.FC = () => {
  const {
    activeDayId,
    setActiveDayId,
    days,
    scenes,
    saveDay,
    deleteDay,
    addScene,
    updateScene,
    deleteScene,
  } = useStore();
  const { openTicketModal, showToast } = useUI();

  const isInitialLoad = useRef(true);
  const isDirty = useRef(false);

  const currentDayLog = days.find((d) => d.id === activeDayId);

  const [title, setTitle] = useState(currentDayLog?.title || '');
  const [rating, setRating] = useState(currentDayLog?.rating || 0);
  const [isLiked, setIsLiked] = useState(currentDayLog?.isLiked || false);
  const [dialogueQuote, setDialogueQuote] = useState(currentDayLog?.dialogueQuote || '');
  const [reviewText, setReviewText] = useState(currentDayLog?.reviewText || '');
  const [genres, setGenres] = useState<string[]>(currentDayLog?.genres || []);
  const [location, setLocation] = useState(currentDayLog?.location || '');
  const [posterType, setPosterType] = useState<'custom' | 'template'>(
    currentDayLog?.posterType || 'template'
  );
  const [posterTemplateId, setPosterTemplateId] = useState(
    currentDayLog?.posterTemplateId || getDayOfWeekTemplateId(activeDayId)
  );
  const [posterImage, setPosterImage] = useState<string | null | undefined>(
    currentDayLog?.posterImage
  );

  // New Scene Form State
  const [newSceneText, setNewSceneText] = useState('');
  const [newSceneTime, setNewSceneTime] = useState(get24HourTimeString());
  const [newSceneLocation, setNewSceneLocation] = useState('');
  const [isAddingScene, setIsAddingScene] = useState(false);

  // Editing Existing Scene State
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editSceneText, setEditSceneText] = useState('');
  const [editSceneTime, setEditSceneTime] = useState('');
  const [editSceneLocation, setEditSceneLocation] = useState('');

  // Modals & Confirmations
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [deleteDayConfirmOpen, setDeleteDayConfirmOpen] = useState(false);

  // Sync state when activeDayId or days changes without marking dirty
  useEffect(() => {
    isInitialLoad.current = true;
    isDirty.current = false;
    const existing = days.find((d) => d.id === activeDayId);
    setTitle(existing?.title || '');
    setRating(existing?.rating || 0);
    setIsLiked(existing?.isLiked || false);
    setDialogueQuote(existing?.dialogueQuote || '');
    setReviewText(existing?.reviewText || '');
    setGenres(existing?.genres || []);
    setLocation(existing?.location || '');
    setPosterType(existing?.posterType || 'template');
    setPosterTemplateId(existing?.posterTemplateId || getDayOfWeekTemplateId(activeDayId));
    setPosterImage(existing?.posterImage || null);
    setEditingSceneId(null);
  }, [activeDayId, days]);

  // Clean, debounced autosave that ONLY runs when user actively edits
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (!isDirty.current) {
      return;
    }

    const timer = setTimeout(async () => {
      await saveDay({
        id: activeDayId,
        title: title.slice(0, TITLE_MAX_LENGTH),
        rating: Math.min(Math.max(rating, 0), 5.0),
        isLiked,
        dialogueQuote: dialogueQuote.slice(0, DIALOGUE_MAX_LENGTH),
        reviewText: reviewText.slice(0, REVIEW_MAX_LENGTH),
        genres,
        location: location.slice(0, 80),
        posterType,
        posterTemplateId,
        posterImage,
      });
      isDirty.current = false;
    }, 600);

    return () => clearTimeout(timer);
  }, [
    activeDayId,
    title,
    rating,
    isLiked,
    dialogueQuote,
    reviewText,
    genres,
    location,
    posterType,
    posterTemplateId,
    posterImage,
    saveDay,
  ]);

  const handleRatingChange = (newRating: number) => {
    isDirty.current = true;
    const clamped = Math.min(Math.max(newRating, 0), 5.0);
    setRating(clamped);
    if (clamped === 5.0) {
      confetti({
        particleCount: 100,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#ffcc00', '#888888', '#2c72ffff'],
      });
      showToast('Masterpiece! 5-Star Day logged.', 'success');
    }
  };

  const handleToggleGenre = (g: string) => {
    isDirty.current = true;
    if (genres.includes(g)) {
      setGenres(genres.filter((item) => item !== g));
    } else {
      if (genres.length >= 4) {
        showToast('Max 4 genres per day', 'info');
        return;
      }
      setGenres([...genres, g]);
    }
  };

  const handleAddSceneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContent = newSceneText.trim().slice(0, SCENE_MAX_LENGTH);
    if (!cleanContent) {
      showToast('Scene note cannot be empty', 'error');
      return;
    }

    await addScene({
      dayId: activeDayId,
      time: newSceneTime.trim() || get24HourTimeString(),
      content: cleanContent,
      location: newSceneLocation.trim().slice(0, 50) || undefined,
    });

    setNewSceneText('');
    setNewSceneLocation('');
    setIsAddingScene(false);
    showToast('Scene recorded', 'success');
  };

  const startEditingScene = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setEditSceneText(scene.content);
    setEditSceneTime(scene.time);
    setEditSceneLocation(scene.location || '');
  };

  const handleUpdateSceneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSceneId) return;

    const cleanContent = editSceneText.trim().slice(0, SCENE_MAX_LENGTH);
    if (!cleanContent) {
      showToast('Scene note cannot be empty', 'error');
      return;
    }

    await updateScene(editingSceneId, {
      time: editSceneTime.trim() || get24HourTimeString(),
      content: cleanContent,
      location: editSceneLocation.trim().slice(0, 50) || undefined,
    });

    setEditingSceneId(null);
    showToast('Scene updated', 'success');
  };

  const handleDeleteCurrentDay = async () => {
    await deleteDay(activeDayId);
    setTitle('');
    setRating(0);
    setIsLiked(false);
    setDialogueQuote('');
    setReviewText('');
    setGenres([]);
    setLocation('');
    setPosterImage(null);
    setDeleteDayConfirmOpen(false);
    showToast(`Day log cleared`, 'info');
  };

  const handlePrevDay = () => {
    try {
      const parsed = parseISO(activeDayId);
      if (isValid(parsed)) {
        const d = subDays(parsed, 1);
        setActiveDayId(format(d, 'yyyy-MM-dd'));
      }
    } catch {}
  };

  const handleNextDay = () => {
    try {
      const todayStr = getTodayString();
      if (activeDayId >= todayStr) return;
      const parsed = parseISO(activeDayId);
      if (isValid(parsed)) {
        const d = addDays(parsed, 1);
        setActiveDayId(format(d, 'yyyy-MM-dd'));
      }
    } catch {}
  };

  const currentDayScenes = scenes.filter((s) => s.dayId === activeDayId);
  const isToday = activeDayId === getTodayString();
  const isFutureBlocked = isToday || activeDayId >= getTodayString();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
      {/* Uncluttered Date Header with Enhanced Legibility */}
      <div className="flex items-center justify-between gap-2 border-b border-theme-subtle pb-3">
        {/* Clickable Date Picker Header */}
        <button
          type="button"
          onClick={() => setCalendarModalOpen(true)}
          className="flex items-center gap-2 text-left group select-none py-1 rounded-xl transition-press active:scale-[0.97]"
          title="Pick date from calendar"
        >
          <div className="p-2 rounded-xl bg-theme-elevated border border-theme-subtle text-theme-primary group-hover:border-theme-strong transition-micro shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-theme-primary font-sans group-hover:underline">
              {formatDateShort(activeDayId)}
            </h1>
            {isToday && (
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-theme-primary text-theme-primary border border-theme-subtle shrink-0">
                Today
              </span>
            )}
          </div>
        </button>

        {/* Date Jump Steppers */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrevDay}
            aria-label="Previous day"
            className="p-2 rounded-xl border border-theme-subtle bg-theme-elevated hover:brightness-110 text-theme-secondary hover:text-theme-primary transition-press active:scale-[0.95] min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setActiveDayId(getTodayString())}
              aria-label="Jump to today"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-theme-elevated hover:brightness-110 text-theme-secondary border border-theme-subtle transition-press active:scale-[0.96]"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={handleNextDay}
            disabled={isFutureBlocked}
            aria-label="Next day"
            className="p-2 rounded-xl border border-theme-subtle bg-theme-elevated hover:brightness-110 text-theme-secondary hover:text-theme-primary transition-press active:scale-[0.95] min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            title={isFutureBlocked ? 'Future dates blocked' : 'Next Day'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openTicketModal(activeDayId)}
            aria-label="Export Cinema Ticket"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-primary text-theme-primary border border-theme-subtle text-xs font-semibold hover:bg-theme-elevated transition-press active:scale-[0.96] ml-1 min-h-[36px]"
            title="Export Cinema Ticket"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Date-Scoped Day Content with fluid AnimatePresence transition */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeDayId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Hero Poster & Rating Row */}
        <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface border border-theme-subtle flex items-center gap-4 shadow-xs">
          {/* Scalable Poster Card */}
          <button
            type="button"
            onClick={() => setPosterModalOpen(true)}
            aria-label="Change poster artwork or upload photo"
            className="relative w-20 sm:w-24 aspect-poster rounded-xl overflow-hidden border border-theme-subtle shrink-0 cursor-pointer group shadow-sm active:scale-[0.97] transition-micro bg-black flex items-center justify-center p-0"
            title="Change Poster"
          >
            <PosterDisplay
              day={{
                id: activeDayId,
              title,
              rating,
              posterType,
              posterImage,
              posterTemplateId,
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <Camera className="w-5 h-5" />
          </div>
        </button>

        {/* Rating and Like Controls */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
          {/* Top Label */}
          <label htmlFor="day-rating-slider" className="text-[11px] font-mono uppercase tracking-wider text-theme-muted font-bold block">
            Your Rating
          </label>

          {/* Stars and Liked Heart in ONE line at same height */}
          <div className="flex items-center justify-between gap-2">
            <StarRating id="day-rating-slider" value={rating} onChange={handleRatingChange} size="lg" showLabel={false} />
            <LikedHeart
              isLiked={isLiked}
              onToggle={() => {
                isDirty.current = true;
                setIsLiked(!isLiked);
              }}
              size="md"
            />
          </div>

          {/* Bottom Action Pill */}
          <button
            type="button"
            onClick={() => setPosterModalOpen(true)}
            className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-elevated hover:brightness-110 border border-theme-subtle text-xs font-semibold text-theme-primary transition-all active:scale-95 shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-theme-secondary" />
            <span>Change Poster</span>
          </button>
        </div>
      </div>

      {/* Main Form Fields Container with High Legibility */}
      <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-4 sm:space-y-5 shadow-xs">
        {/* Day Title / Logline */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="day-title-input" className="block text-xs font-mono tracking-wider uppercase text-theme-muted font-bold">
              Day Title / Logline
            </label>
            <span className="text-[11px] font-mono text-theme-muted">
              {title.length}/{TITLE_MAX_LENGTH}
            </span>
          </div>
          <input
            id="day-title-input"
            type="text"
            maxLength={TITLE_MAX_LENGTH}
            value={title}
            onChange={(e) => {
              isDirty.current = true;
              setTitle(e.target.value);
            }}
            placeholder="e.g. The Breakthrough Script, Sunday Reset..."
            className="w-full h-11 px-4 rounded-xl bg-theme-input border border-theme-subtle text-theme-primary placeholder:text-theme-muted text-sm sm:text-base font-semibold focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />
        </div>

        {/* Dialogue of the Day Quote Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="day-quote-input" className="flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-theme-muted font-bold">
              <Quote className="w-3.5 h-3.5 text-theme-secondary" />
              <span>Dialogue of the Day</span>
            </label>
            <span className="text-[11px] font-mono text-theme-muted">
              {dialogueQuote.length}/{DIALOGUE_MAX_LENGTH}
            </span>
          </div>
          <input
            id="day-quote-input"
            type="text"
            maxLength={DIALOGUE_MAX_LENGTH}
            value={dialogueQuote}
            onChange={(e) => {
              isDirty.current = true;
              setDialogueQuote(e.target.value);
            }}
            placeholder='"A memorable line spoken or thought..."'
            className="w-full h-10 px-4 italic font-serif text-sm sm:text-base rounded-xl bg-theme-input border border-theme-subtle text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />
        </div>

        {/* Genre / Mood Pills */}
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-theme-muted font-bold mb-2">
            Genres & Moods ({genres.length}/4)
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Genre tags">
            {GENRE_OPTIONS.map((g) => {
              const isSelected = genres.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggleGenre(g)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-micro active:scale-[0.96] ${
                    isSelected
                      ? 'bg-theme-primary text-theme-primary border border-theme-primary font-bold shadow-xs'
                      : 'bg-theme-input text-theme-secondary hover:text-theme-primary border border-theme-subtle'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] animate-in fade-in zoom-in-75 duration-100" />}
                  <span>{g}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="day-location-input" className="flex items-center gap-1 text-xs font-mono tracking-wider uppercase text-theme-muted font-bold mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-theme-secondary" />
            <span>Location</span>
          </label>
          <input
            id="day-location-input"
            type="text"
            maxLength={80}
            value={location}
            onChange={(e) => {
              isDirty.current = true;
              setLocation(e.target.value);
            }}
            placeholder="e.g. Home, Studio, City Center"
            className="w-full h-10 px-4 rounded-xl bg-theme-input border border-theme-subtle text-xs sm:text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />
        </div>

        {/* Daily Synopsis / Review */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="day-review-textarea" className="block text-xs font-mono tracking-wider uppercase text-theme-muted font-bold">
              Synopsis / Evening Wrap
            </label>
            <span className="text-[11px] font-mono text-theme-muted">
              {reviewText.length}/{REVIEW_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="day-review-textarea"
            rows={3}
            maxLength={REVIEW_MAX_LENGTH}
            value={reviewText}
            onChange={(e) => {
              isDirty.current = true;
              setReviewText(e.target.value);
            }}
            placeholder="Reflect on the day's events, thoughts, and memories..."
            className="w-full p-3.5 rounded-xl bg-theme-input border border-theme-subtle text-xs sm:text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary leading-relaxed resize-y font-sans"
          />
        </div>

        {/* INTRA-DAY SCENE TIMELINE */}
        <div className="border-t border-theme-subtle pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-theme-secondary" />
              <h3 className="text-xs sm:text-sm font-bold text-theme-primary uppercase tracking-wider font-mono">
                Scenes Timeline ({currentDayScenes.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewSceneTime(get24HourTimeString());
                setIsAddingScene(!isAddingScene);
                setEditingSceneId(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-elevated hover:brightness-110 border border-theme-subtle text-xs font-semibold text-theme-primary transition-press active:scale-[0.96]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Scene</span>
            </button>
          </div>

          {/* Add New Scene Composer */}
          {isAddingScene && (
            <form
              onSubmit={handleAddSceneSubmit}
              className="p-4 rounded-xl bg-theme-input border border-theme-subtle space-y-3 animate-in fade-in duration-150 shadow-xs"
            >
              <div className="space-y-2">
                <TimePickerSegmented
                  value={newSceneTime}
                  onChange={(t) => setNewSceneTime(t)}
                />

                <input
                  type="text"
                  maxLength={50}
                  value={newSceneLocation}
                  onChange={(e) => setNewSceneLocation(e.target.value)}
                  placeholder="Location (optional)"
                  className="w-full h-9 px-3.5 text-xs sm:text-sm rounded-xl bg-theme-surface border border-theme-subtle text-theme-primary placeholder:text-theme-muted focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  maxLength={SCENE_MAX_LENGTH}
                  value={newSceneText}
                  onChange={(e) => setNewSceneText(e.target.value)}
                  placeholder="What happened? Capture this moment..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-theme-surface border border-theme-subtle text-theme-primary placeholder:text-theme-muted focus:outline-none leading-relaxed"
                  autoFocus
                />
                <div className="text-right text-[10px] font-mono text-theme-muted mt-1">
                  {newSceneText.length}/{SCENE_MAX_LENGTH}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingScene(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-theme-muted hover:text-theme-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-theme-primary text-theme-primary border border-theme-subtle font-semibold text-xs sm:text-sm active:scale-95 shadow-xs"
                >
                  Add Moment
                </button>
              </div>
            </form>
          )}

          {/* Edit Existing Scene Form */}
          {editingSceneId && (
            <form
              onSubmit={handleUpdateSceneSubmit}
              className="p-4 rounded-xl bg-theme-elevated border-2 border-theme-strong space-y-3 animate-in fade-in duration-150 shadow-md"
            >
              <div className="flex items-center justify-between text-xs font-mono uppercase text-theme-muted font-bold">
                <span>Edit Scene Moment</span>
                <button
                  type="button"
                  onClick={() => setEditingSceneId(null)}
                  className="text-xs text-theme-muted hover:text-theme-primary"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-2">
                <TimePickerSegmented
                  value={editSceneTime}
                  onChange={(t) => setEditSceneTime(t)}
                />

                <input
                  type="text"
                  maxLength={50}
                  value={editSceneLocation}
                  onChange={(e) => setEditSceneLocation(e.target.value)}
                  placeholder="Location (optional)"
                  className="w-full h-9 px-3.5 text-xs sm:text-sm rounded-xl bg-theme-surface border border-theme-subtle text-theme-primary placeholder:text-theme-muted focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  maxLength={SCENE_MAX_LENGTH}
                  value={editSceneText}
                  onChange={(e) => setEditSceneText(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-theme-surface border border-theme-subtle text-theme-primary placeholder:text-theme-muted focus:outline-none leading-relaxed"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSceneId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-theme-muted hover:text-theme-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-theme-primary text-theme-primary border border-theme-subtle font-semibold text-xs sm:text-sm active:scale-95 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* List of Scenes with Edit & Delete */}
          {currentDayScenes.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-theme-subtle text-center text-xs font-mono text-theme-muted">
              No scenes yet. Tap "+ Log Scene" to timeline moments.
            </div>
          ) : (
            <div className="space-y-2">
              {currentDayScenes.map((scene) => (
                <div
                  key={scene.id}
                  className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-theme-input border border-theme-subtle hover:border-theme-strong transition-micro group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-theme-primary shrink-0 pt-0.5">
                      {scene.time}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs sm:text-sm text-theme-primary leading-relaxed break-words">
                        {scene.content}
                      </p>
                      {scene.location && (
                        <span className="text-xs font-mono text-theme-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-theme-muted" />
                          {scene.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scene Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditingScene(scene)}
                      className="text-theme-muted hover:text-theme-primary p-1.5 rounded-lg hover:bg-theme-surface transition-micro active:scale-[0.92]"
                      title="Edit scene"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteScene(scene.id);
                        showToast('Scene deleted', 'info');
                      }}
                      className="text-theme-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-theme-surface transition-micro active:scale-[0.92]"
                      title="Delete scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete / Clear Entire Day Log Section */}
        {currentDayLog && (
          <div className="border-t border-theme-subtle pt-4 flex items-center justify-between">
            <span className="text-xs font-mono text-theme-muted">
              Logged on {currentDayLog.id}
            </span>
            <button
              type="button"
              onClick={() => setDeleteDayConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-press active:scale-[0.96]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Day Log</span>
            </button>
          </div>
        )}
      </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Day Confirmation Modal Sheet */}
      {deleteDayConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md modal-backdrop-fade">
          <div className="relative w-full max-w-sm bg-theme-surface border border-theme-subtle rounded-3xl p-5 shadow-2xl space-y-4 modal-pop">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-theme-primary">Delete Day Log?</h3>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed">
              Are you sure you want to delete all log data, scenes, and ratings for{' '}
              <strong className="text-theme-primary">{activeDayId}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDayConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-theme-muted hover:text-theme-primary transition-micro"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentDay}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-press active:scale-[0.96] shadow-xs"
              >
                Yes, Delete Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Picker Modal */}
      <CalendarPickerModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        selectedDateStr={activeDayId}
        onSelectDate={(newDate) => {
          setActiveDayId(newDate);
          showToast(`Jumped to ${formatDateShort(newDate)}`, 'info');
        }}
        days={days}
      />

      {/* Poster Selector Modal */}
      <PosterSelectorModal
        isOpen={posterModalOpen}
        onClose={() => setPosterModalOpen(false)}
        currentType={posterType}
        currentTemplateId={posterTemplateId}
        currentImage={posterImage}
        onSelectTemplate={(tid) => {
          isDirty.current = true;
          setPosterType('template');
          setPosterTemplateId(tid);
          setPosterImage(null);
        }}
        onUploadImage={(dataUri) => {
          isDirty.current = true;
          setPosterType('custom');
          setPosterImage(dataUri);
        }}
      />
    </div>
  );
};
