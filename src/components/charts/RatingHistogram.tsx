import React from 'react';
import { DayLog } from '../../types';

interface RatingHistogramProps {
  days: DayLog[];
}

interface StarTier {
  stars: number;
  count: number;
  percentage: number;
}

export const RatingHistogram: React.FC<RatingHistogramProps> = ({ days }) => {
  const ratedDays = days.filter((d) => d.rating > 0);
  const totalRated = ratedDays.length;

  const tiers: StarTier[] = [
    { stars: 5, ratings: [5.0, 4.5] },
    { stars: 4, ratings: [4.0, 3.5] },
    { stars: 3, ratings: [3.0, 2.5] },
    { stars: 2, ratings: [2.0, 1.5] },
    { stars: 1, ratings: [1.0, 0.5] },
  ].map((tier) => {
    const count = ratedDays.filter((d) => tier.ratings.includes(d.rating)).length;
    const percentage = totalRated > 0 ? Math.round((count / totalRated) * 100) : 0;
    return {
      stars: tier.stars,
      count,
      percentage,
    };
  });

  return (
    <div className="w-full space-y-2 select-none">
      {/* 5-Star Horizontal Tracks tightly matched with Days chart */}
      <div className="space-y-1.5" role="group" aria-label="Ratings Breakdown">
        {tiers.map((tier) => (
          <div
            key={tier.stars}
            className="w-full flex items-center gap-2.5 text-[11px] font-mono text-left"
          >
            {/* Left Rating Label */}
            <span className="w-7 text-theme-muted font-semibold shrink-0">
              {tier.stars}★
            </span>

            {/* Horizontal Progress Track */}
            <div className="flex-1 h-3.5 sm:h-4 rounded-lg bg-theme-input border border-theme-subtle overflow-hidden relative shadow-inner">
              <div
                className="h-full rounded-md bg-gradient-to-r from-[#ffaa00] via-[#fbbf24] to-[#f59e0b] transition-all duration-300"
                style={{ width: `${tier.percentage}%` }}
              />
            </div>

            {/* Right Count & Percentage */}
            <div className="w-12 text-right shrink-0 text-[11px] font-mono">
              <span className="font-bold text-theme-primary">{tier.count}</span>
              <span className="text-theme-muted text-[10px] ml-1 opacity-75">
                {tier.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Bottom Summary */}
      <div className="text-center pt-0.5 text-[11px] font-mono text-theme-muted">
        {totalRated > 0 ? `${totalRated} total rated ${totalRated === 1 ? 'day' : 'days'}` : 'No rated days logged yet'}
      </div>
    </div>
  );
};

