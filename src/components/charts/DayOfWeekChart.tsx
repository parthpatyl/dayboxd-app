import React from 'react';
import { DayLog } from '../../types';
import { parseISO, getDay } from 'date-fns';

interface DayOfWeekChartProps {
  days: DayLog[];
}

export const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({ days }) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayBuckets: { name: string; count: number; totalRating: number; avg: number }[] = dayNames.map((name) => ({
    name,
    count: 0,
    totalRating: 0,
    avg: 0,
  }));

  days.forEach((d) => {
    if (d.rating > 0) {
      try {
        const dayIdx = getDay(parseISO(d.id));
        dayBuckets[dayIdx].count += 1;
        dayBuckets[dayIdx].totalRating += d.rating;
      } catch {}
    }
  });

  dayBuckets.forEach((b) => {
    b.avg = b.count > 0 ? b.totalRating / b.count : 0;
  });

  return (
    <div className="w-full space-y-1.5">
      {dayBuckets.map((b) => {
        const widthPct = (b.avg / 5.0) * 100;
        return (
          <div key={b.name} className="flex items-center gap-2.5 text-[11px] font-mono">
            <span className="w-7 text-theme-muted font-semibold">{b.name}</span>
            <div className="flex-1 h-3.5 sm:h-4 rounded-lg bg-theme-input border border-theme-subtle overflow-hidden relative shadow-inner">
              <div
                className="h-full rounded-md bg-gradient-to-r from-[#ffaa00] via-[#fbbf24] to-[#f59e0b] transition-all duration-500"
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="w-9 text-right text-theme-primary font-bold">
              {b.avg > 0 ? `${b.avg.toFixed(1)}★` : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
};
