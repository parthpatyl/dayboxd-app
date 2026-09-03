import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { RatingHistogram } from '../components/charts/RatingHistogram';
import { ActivityHeatmap } from '../components/charts/ActivityHeatmap';
import { DayOfWeekChart } from '../components/charts/DayOfWeekChart';
import { BarChart3, Star, Heart, Film, TrendingUp, Calendar } from 'lucide-react';

export const Stats: React.FC = () => {
  const { days, profile } = useStore();

  const [activeChartTab, setActiveChartTab] = useState<'histogram' | 'heatmap' | 'velocity'>('histogram');

  const totalDays = days.length;
  const ratedDays = days.filter((d) => d.rating > 0);
  const totalLiked = days.filter((d) => d.isLiked).length;

  const avgRating =
    ratedDays.length > 0
      ? ratedDays.reduce((acc, d) => acc + d.rating, 0) / ratedDays.length
      : 0;

  // Genre Frequency
  const genreCounts: Record<string, number> = {};
  days.forEach((d) => {
    d.genres.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-subtle pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-theme-primary font-sans tracking-tight">
              Stats
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-theme-elevated text-theme-secondary border border-theme-subtle">
              ANALYTICS
            </span>
          </div>
          <p className="text-xs sm:text-sm font-mono text-theme-secondary mt-0.5">
            Metrics for {profile?.username || 'You'}
          </p>
        </div>
      </div>

      {/* 3 High-Signal Core Headline Metrics */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* Total Days */}
        <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-1 shadow-xs text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between text-theme-secondary">
            <span className="text-xs font-mono uppercase font-bold">Total Days</span>
            <Film className="w-3.5 h-3.5 text-theme-secondary hidden sm:inline" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-theme-primary font-sans">{totalDays}</div>
          <div className="text-xs font-mono text-theme-muted">{ratedDays.length} rated</div>
        </div>

        {/* Avg Rating */}
        <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-1 shadow-xs text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between text-theme-secondary">
            <span className="text-xs font-mono uppercase font-bold">Avg Rating</span>
            <Star className="w-3.5 h-3.5 text-[#ffcc00] hidden sm:inline" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-theme-primary font-sans">
            {avgRating > 0 ? `${avgRating.toFixed(2)}` : '—'}
          </div>
        </div>

        {/* Liked % */}
        <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-1 shadow-xs text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between text-theme-secondary">
            <span className="text-xs font-mono uppercase font-bold">Liked Ratio</span>
            <Heart className="w-3.5 h-3.5 text-red-500 hidden sm:inline" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-theme-primary font-sans">
            {totalDays > 0 ? `${Math.round((totalLiked / totalDays) * 100)}%` : '0%'}
          </div>
          <div className="text-xs font-mono text-theme-muted">{totalLiked} days</div>
        </div>
      </div>

      {/* Primary Visualization Card with Segmented View Switcher */}
      <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-4 shadow-xs">
        {/* Segmented Switcher Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-subtle pb-3">
          <span className="text-xs font-mono uppercase text-theme-secondary font-bold">
            Graph
          </span>

          <div role="tablist" aria-label="Telemetry Graph View" className="flex items-center gap-1 bg-theme-input border border-theme-subtle rounded-xl p-1 text-xs font-mono">
            <button
              type="button"
              role="tab"
              aria-selected={activeChartTab === 'histogram'}
              onClick={() => setActiveChartTab('histogram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors active:scale-95 min-h-[32px] ${
                activeChartTab === 'histogram'
                  ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Ratings</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeChartTab === 'heatmap'}
              onClick={() => setActiveChartTab('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors active:scale-95 min-h-[32px] ${
                activeChartTab === 'heatmap'
                  ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Heatmap</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeChartTab === 'velocity'}
              onClick={() => setActiveChartTab('velocity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors active:scale-95 min-h-[32px] ${
                activeChartTab === 'velocity'
                  ? 'bg-theme-primary text-theme-primary font-bold shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Velocity</span>
            </button>
          </div>
        </div>

        {/* Selected Chart Rendering */}
        <div className="py-1">
          {activeChartTab === 'histogram' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="text-center text-xs font-mono text-theme-secondary font-semibold">
                Rating Velocity
              </div>
              <RatingHistogram days={days} />
            </div>
          )}

          {activeChartTab === 'heatmap' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="text-center text-xs font-mono text-theme-secondary font-semibold">
                16-Week Consistency Matrix
              </div>
              <ActivityHeatmap days={days} />
            </div>
          )}

          {activeChartTab === 'velocity' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="text-center text-xs font-mono text-theme-secondary font-semibold">
                Average Rating by Day of Week
              </div>
              <DayOfWeekChart days={days} />
            </div>
          )}
        </div>
      </div>

      {/* Top Genres / Moods Cloud */}
      <div className="p-3 sm:p-4 rounded-xl bg-theme-surface border border-theme-subtle space-y-2 shadow-xs">
        <h3 className="text-[11px] font-bold text-theme-primary uppercase tracking-wider font-mono">
          Frequent Vibes & Genres
        </h3>
        {sortedGenres.length === 0 ? (
          <div className="text-[10px] font-mono text-theme-muted">No genres tagged yet.</div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {sortedGenres.map(([genre, count]) => (
              <div
                key={genre}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-theme-elevated border border-theme-subtle text-[11px] font-medium text-theme-primary"
              >
                <span>{genre}</span>
                <span className="px-1 py-0.1 rounded bg-theme-input text-theme-secondary text-[8px] font-mono font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
