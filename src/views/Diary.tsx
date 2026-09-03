import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatDayAndMonth } from '../lib/format';
import { PosterDisplay } from '../components/posters/PosterDisplay';
import { Search, Plus, Calendar as CalendarIcon, Heart, ChevronRight, Check } from 'lucide-react';
import { GENRE_OPTIONS } from '../types';
import { useNavigate } from 'react-router-dom';

export const Diary: React.FC = () => {
  const { days, scenes, filter, setFilter, setActiveDayId } = useStore();
  const navigate = useNavigate();

  // Filtered & Sorted Days list
  const filteredDays = useMemo(() => {
    return days.filter((d) => {
      if (filter.likedOnly && !d.isLiked) return false;
      if (filter.minRating > 0 && d.rating < filter.minRating) return false;
      if (filter.selectedGenre && !d.genres.includes(filter.selectedGenre)) return false;
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesTitle = d.title.toLowerCase().includes(query);
        const matchesQuote = d.dialogueQuote.toLowerCase().includes(query);
        const matchesReview = d.reviewText.toLowerCase().includes(query);
        const matchesLocation = d.location.toLowerCase().includes(query);
        if (!matchesTitle && !matchesQuote && !matchesReview && !matchesLocation) return false;
      }
      return true;
    });
  }, [days, filter]);

  const handleRowClick = (dayId: string) => {
    navigate(`/day/${dayId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto px-1 sm:px-0">
      {/* View Title & Log Action */}
      <div className="flex items-center justify-between gap-3 border-b border-theme-subtle pb-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-theme-primary font-sans tracking-tight">The Diary</h1>
          <p className="text-xs font-mono text-theme-muted mt-0.5">
            {filteredDays.length} logged {filteredDays.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button
          onClick={() => {
            setActiveDayId(new Date().toISOString().split('T')[0]);
            navigate('/');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-theme-primary text-theme-primary border border-theme-subtle font-semibold text-xs sm:text-sm hover:bg-theme-elevated transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Log Day</span>
        </button>
      </div>

      {/* Streamlined Filter Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <label htmlFor="diary-search-input" className="sr-only">Search diary entries</label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
            <input
              id="diary-search-input"
              type="text"
              value={filter.searchQuery}
              onChange={(e) => setFilter({ searchQuery: e.target.value })}
              placeholder="Search diary entries, quotes, places..."
              className="w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm rounded-xl bg-theme-surface border border-theme-subtle text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary"
            />
          </div>

          <button
            type="button"
            aria-label="Filter liked entries only"
            aria-pressed={filter.likedOnly}
            onClick={() => setFilter({ likedOnly: !filter.likedOnly })}
            className={`flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors active:scale-95 shadow-xs shrink-0 ${
              filter.likedOnly
                ? 'bg-theme-primary text-theme-primary border-theme-primary font-bold'
                : 'bg-theme-surface text-theme-secondary hover:text-theme-primary border-theme-subtle'
            }`}
          >
            {filter.likedOnly ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            )}
            <span>Liked</span>
          </button>
        </div>

        {/* Genre Pill Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="toolbar" aria-label="Filter by genre">
          <button
            type="button"
            aria-pressed={filter.selectedGenre === null}
            onClick={() => setFilter({ selectedGenre: null })}
            className={`px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              filter.selectedGenre === null
                ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                : 'bg-theme-surface text-theme-secondary hover:text-theme-primary border border-theme-subtle'
            }`}
          >
            All Genres
          </button>
          {GENRE_OPTIONS.map((g) => {
            const isSelected = filter.selectedGenre === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setFilter({ selectedGenre: isSelected ? null : g })}
                className={`px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                    : 'bg-theme-surface text-theme-secondary hover:text-theme-primary border border-theme-subtle'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diary Entries List - Clean High-Legibility Cinema Cards */}
      {filteredDays.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-theme-surface border border-dashed border-theme-subtle space-y-3">
          <CalendarIcon className="w-8 h-8 text-theme-muted mx-auto" />
          <h3 className="text-base font-bold text-theme-primary">No diary entries found</h3>
          <p className="text-xs sm:text-sm font-mono text-theme-secondary max-w-sm mx-auto">
            {filter.searchQuery || filter.likedOnly || filter.selectedGenre
              ? 'Try changing your filter criteria.'
              : 'Start logging your daily film to build your cinema diary.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3" role="feed" aria-label="Diary Entries">
          {filteredDays.map((day) => {
            const dayScenes = scenes.filter((s) => s.dayId === day.id);
            const dateObj = formatDayAndMonth(day.id);
            return (
              <button
                type="button"
                key={day.id}
                onClick={() => handleRowClick(day.id)}
                className="w-full text-left group relative p-3.5 sm:p-4 rounded-2xl bg-theme-surface border border-theme-subtle hover:border-theme-strong transition-transform cursor-pointer flex items-center gap-4 shadow-xs active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              >
                {/* Poster Thumbnail */}
                <div className="w-16 sm:w-20 aspect-poster rounded-xl overflow-hidden shrink-0 border border-theme-subtle group-hover:border-theme-strong shadow-xs bg-black">
                  <PosterDisplay day={day} className="w-full h-full object-cover" />
                </div>

                {/* Day Details with Legible Typography */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Top Line: Date & Rating */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-mono font-bold text-theme-primary">
                      {dateObj.month} {dateObj.day}
                    </span>

                    <div className="flex items-center gap-2">
                      {day.isLiked && (
                        <Heart className="w-4 h-4 fill-red-500 text-red-500 shrink-0" />
                      )}
                      {day.rating > 0 && (
                        <span className="text-xs sm:text-sm font-mono font-bold text-[#ffcc00]">
                          {day.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title / Logline */}
                  <h3 className="text-sm sm:text-base font-bold text-theme-primary truncate font-sans group-hover:text-theme-primary">
                    {day.title || 'Untitled Day'}
                  </h3>

                  {/* Subtitle: Quote or Meta */}
                  {day.dialogueQuote ? (
                    <p className="text-xs sm:text-sm italic font-serif text-theme-secondary truncate">
                      "{day.dialogueQuote}"
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
                      {day.genres[0] && <span>{day.genres[0]}</span>}
                      {dayScenes.length > 0 && <span>• {dayScenes.length} moments</span>}
                    </div>
                  )}
                </div>

                {/* Arrow indicator */}
                <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-primary transition-transform group-hover:translate-x-0.5 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
