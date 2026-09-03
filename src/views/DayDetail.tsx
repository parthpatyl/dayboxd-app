import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useUI } from '../store/useUI';
import { formatDateFull } from '../lib/format';
import { PosterDisplay } from '../components/posters/PosterDisplay';
import { StarRating } from '../components/ui/StarRating';
import {
  ArrowLeft,
  Ticket,
  Edit2,
  Trash2,
  Quote,
  Clock,
  MapPin,
  Heart,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export const DayDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { days, scenes, deleteDay, setActiveDayId } = useStore();
  const { openTicketModal, showToast } = useUI();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const day = days.find((d) => d.id === id);
  const dayScenes = scenes.filter((s) => s.dayId === id);

  if (!day || !id) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-base font-bold text-theme-primary">Day not found</h2>
        <button
          onClick={() => navigate('/diary')}
          className="px-4 py-2 rounded-xl bg-theme-elevated text-xs text-theme-primary border border-theme-subtle"
        >
          Back to Diary
        </button>
      </div>
    );
  }

  const handleEditInLogbook = () => {
    setActiveDayId(id);
    navigate('/');
  };

  const handleDelete = async () => {
    await deleteDay(id);
    showToast(`Day entry for ${id} deleted`, 'info');
    navigate('/diary');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl mx-auto px-1 sm:px-0">
      {/* Top Bar with Back and Actions */}
      <div className="flex items-center justify-between border-b border-theme-subtle pb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 p-2 rounded-xl border border-theme-subtle bg-theme-elevated hover:brightness-110 text-theme-primary text-xs font-semibold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openTicketModal(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-elevated border border-theme-subtle text-theme-primary text-xs font-semibold hover:brightness-110 transition-all active:scale-95 shadow-xs"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Ticket</span>
          </button>

          <button
            onClick={handleEditInLogbook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-primary text-theme-primary border border-theme-subtle text-xs font-semibold hover:bg-theme-elevated transition-all active:scale-95 shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-theme-surface border border-theme-subtle flex flex-col sm:flex-row gap-5 items-center sm:items-start shadow-xs">
        {/* Large Poster */}
        <div className="w-28 sm:w-36 aspect-poster rounded-2xl overflow-hidden border border-theme-subtle shadow-md shrink-0 bg-black">
          <PosterDisplay day={day} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left w-full">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap text-theme-muted text-xs font-mono mb-1">
              <span className="flex items-center gap-1 text-theme-primary font-bold">
                <Calendar className="w-3.5 h-3.5 text-theme-secondary" />
                {formatDateFull(day.id)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-theme-primary font-sans tracking-tight">
              {day.title || 'Untitled Day'}
            </h1>
          </div>

          {/* Rating & Like status */}
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <StarRating value={day.rating} onChange={() => {}} readOnly size="md" showLabel />
            {day.isLiked && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
                <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                <span>Liked</span>
              </span>
            )}
          </div>

          {/* Genre / Mood Badges */}
          {day.genres.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap pt-1">
              {day.genres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-theme-elevated text-theme-secondary border border-theme-subtle"
                >
                  {g}
                </span>
              ))}
              {day.location && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-mono text-theme-muted bg-theme-input border border-theme-subtle">
                  <MapPin className="w-2.5 h-2.5" />
                  {day.location}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogue of the Day (Quote) */}
      {day.dialogueQuote && (
        <div className="p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-2 shadow-xs">
          <div className="flex items-center gap-1.5 text-theme-muted text-[10px] font-mono uppercase tracking-wider font-bold">
            <Quote className="w-3 h-3 text-theme-secondary" />
            <span>Dialogue of the Day</span>
          </div>
          <p className="text-sm sm:text-base font-serif italic text-theme-primary leading-relaxed">
            "{day.dialogueQuote}"
          </p>
        </div>
      )}

      {/* Evening Synopsis / Review */}
      {day.reviewText && (
        <div className="p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-2 shadow-xs">
          <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wider font-mono">
            Synopsis & Reflections
          </h3>
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed whitespace-pre-wrap font-sans">
            {day.reviewText}
          </p>
        </div>
      )}

      {/* Scenes Timeline */}
      <div className="p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-theme-primary">
          <Clock className="w-3.5 h-3.5 text-theme-secondary" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
            Scenes Timeline ({dayScenes.length})
          </h3>
        </div>

        {dayScenes.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-theme-subtle text-center text-xs font-mono text-theme-muted">
            No scenes recorded for this day.
          </div>
        ) : (
          <div className="space-y-2">
            {dayScenes.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-theme-elevated border border-theme-subtle"
              >
                <span className="text-xs font-mono font-bold text-theme-primary shrink-0 pt-0.5">
                  {s.time}
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs text-theme-primary leading-relaxed">{s.content}</p>
                  {s.location && (
                    <span className="text-[10px] font-mono text-theme-muted flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {s.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Danger Action */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Day Entry</span>
        </button>
      </div>

      {/* Delete Confirmation Sheet */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-theme-surface border border-theme-subtle rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-theme-primary">Delete Entry?</h3>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed">
              Are you sure you want to delete the entry and scenes for{' '}
              <strong className="text-theme-primary">{day.id}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-theme-muted hover:text-theme-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs active:scale-95 shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
