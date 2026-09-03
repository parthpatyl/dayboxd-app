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
    <div className="w-full space-y-2.5 select-none py-1">
      {/* 5-Star Horizontal Velocity Tracks */}
      <div className="space-y-2.5" role="group" aria-label="Ratings Breakdown">
        {tiers.map((tier) => (
          <div
            key={tier.stars}
            className="w-full flex items-center gap-3 p-1 -mx-1 rounded-xl transition-all duration-150 text-left"
          >
            {/* Left Rating Label */}
            <div className="w-6 text-right shrink-0">
              <span className="text-xs sm:text-sm font-mono font-bold text-theme-primary">{tier.stars}</span>
            </div>

            {/* Horizontal Progress Track with Added Weight */}
            <div className="flex-1 h-4 sm:h-5 rounded-lg bg-theme-input border border-theme-subtle overflow-hidden relative shadow-inner">
              <div
                className="h-full rounded-md bg-gradient-to-r from-[#ffaa00] via-[#fbbf24] to-[#f59e0b] transition-all duration-300 shadow-xs"
                style={{ width: `${tier.percentage}%` }}
              />
            </div>

            {/* Right Count & Percentage */}
            <div className="w-16 text-right shrink-0 text-xs font-mono">
              <span className="font-bold text-theme-primary">{tier.count}</span>
              <span className="text-theme-secondary text-[11px] ml-1.5 opacity-80">
                {tier.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Clean Bottom Summary */}
      <div className="text-center pt-1 text-xs font-mono text-theme-secondary">
        {totalRated > 0 ? `${totalRated} total rated ${totalRated === 1 ? 'day' : 'days'}` : 'No rated days logged yet'}
      </div>
    </div>
  );
};

