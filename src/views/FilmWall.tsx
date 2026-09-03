import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { PosterDisplay } from '../components/posters/PosterDisplay';
import { GENRE_OPTIONS, SortMode } from '../types';
import { Grid3X3, ArrowUpDown, Check, Heart } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const formatWallDate = (dateId: string) => {
  try {
    const d = parseISO(dateId);
    return format(d, 'MMM d');
  } catch {
    return dateId;
  }
};

export const FilmWall: React.FC = () => {
  const { days } = useStore();
  const navigate = useNavigate();

  const [sortMode, setSortMode] = useState<SortMode>('date-desc');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [likedOnly, setLikedOnly] = useState(false);

  const sortedAndFilteredDays = useMemo(() => {
    let result = [...days];

    if (likedOnly) {
      result = result.filter((d) => d.isLiked);
    }
    if (selectedGenre) {
      result = result.filter((d) => d.genres.includes(selectedGenre));
    }

    result.sort((a, b) => {
      if (sortMode === 'rating-desc') return b.rating - a.rating;
      if (sortMode === 'rating-asc') return a.rating - b.rating;
      if (sortMode === 'date-asc') return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [days, sortMode, selectedGenre, likedOnly]);

  const handleCardClick = (dayId: string) => {
    navigate(`/day/${dayId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-subtle pb-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-theme-primary font-sans tracking-tight">The Film Wall</h1>
          <p className="text-xs sm:text-sm font-mono text-theme-muted mt-0.5">
            Poster gallery ({sortedAndFilteredDays.length} {sortedAndFilteredDays.length === 1 ? 'film' : 'films'})
          </p>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface border border-theme-subtle text-xs sm:text-sm font-medium text-theme-primary shadow-xs">
            <ArrowUpDown className="w-4 h-4 text-theme-muted shrink-0" />
            <select
              aria-label="Sort posters by"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-transparent border-none text-theme-primary focus:outline-none font-medium text-xs sm:text-sm cursor-pointer"
            >
              <option value="date-desc" className="bg-theme-surface text-theme-primary">Newest</option>
              <option value="date-asc" className="bg-theme-surface text-theme-primary">Oldest</option>
              <option value="rating-desc" className="bg-theme-surface text-theme-primary">Highest Rated</option>
              <option value="rating-asc" className="bg-theme-surface text-theme-primary">Lowest Rated</option>
            </select>
          </div>

          {/* Liked Filter */}
          <button
            type="button"
            aria-label="Filter liked days only"
            aria-pressed={likedOnly}
            onClick={() => setLikedOnly(!likedOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold border transition-transform active:scale-95 shadow-xs ${
              likedOnly
                ? 'bg-theme-primary text-theme-primary border-theme-primary font-bold'
                : 'bg-theme-surface text-theme-secondary hover:text-theme-primary border-theme-subtle'
            }`}
          >
            {likedOnly && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>♥ Liked</span>
          </button>
        </div>
      </div>

      {/* Genre Filter Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="toolbar" aria-label="Filter by genre">
        <button
          type="button"
          aria-pressed={selectedGenre === null}
          onClick={() => setSelectedGenre(null)}
          className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-transform active:scale-95 ${
            selectedGenre === null
              ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
              : 'bg-theme-surface text-theme-secondary hover:text-theme-primary border border-theme-subtle'
          }`}
        >
          All
        </button>
        {GENRE_OPTIONS.map((g) => (
          <button
            type="button"
            key={g}
            aria-pressed={selectedGenre === g}
            onClick={() => setSelectedGenre(g === selectedGenre ? null : g)}
            className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-transform active:scale-95 ${
              selectedGenre === g
                ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                : 'bg-theme-surface text-theme-secondary hover:text-theme-primary border border-theme-subtle'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Iconic 3-Column Mobile & Responsive Desktop Poster Grid */}
      {sortedAndFilteredDays.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-theme-surface border border-dashed border-theme-subtle space-y-3">
          <Grid3X3 className="w-8 h-8 text-theme-muted mx-auto" />
          <h3 className="text-base font-bold text-theme-primary">No posters match your criteria</h3>
          <p className="text-xs font-mono text-theme-muted">
            Try resetting your genre filter or date sort.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 sm:gap-4" role="region" aria-label="Poster Grid">
          {sortedAndFilteredDays.map((day) => (
            <button
              type="button"
              key={day.id}
              onClick={() => handleCardClick(day.id)}
              className="group cursor-pointer flex flex-col space-y-1.5 transition-transform duration-150 active:scale-[0.97] text-left p-0 border-0 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary rounded-xl"
            >
              {/* Poster Card (Pure artwork without clutter) */}
              <div className="relative aspect-poster w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-theme-subtle group-hover:border-theme-strong bg-black">
                <PosterDisplay day={day} className="w-full h-full object-cover" />
              </div>

              {/* Enhanced High-Legibility Title & Metadata */}
              <div className="px-0.5 space-y-0.5 w-full">
                <h4 className="text-xs sm:text-sm font-bold text-theme-primary truncate font-sans group-hover:text-theme-primary">
                  {day.title || 'Untitled Day'}
                </h4>
                <div className="text-xs font-mono text-theme-secondary flex items-center justify-between">
                  <span className="shrink-0">{formatWallDate(day.id)}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {day.isLiked && (
                      <Heart className="w-3 h-3 fill-red-500 text-red-500 shrink-0" />
                    )}
                    {day.rating > 0 && (
                      <span className="text-[#ffcc00] font-bold font-mono">{day.rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
