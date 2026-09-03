import React, { useState } from 'react';
import { DayLog } from '../../types';
import { format, subDays, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';

interface ActivityHeatmapProps {
  days: DayLog[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ days }) => {
  const [hoveredInfo, setHoveredInfo] = useState<{ date: string; day?: DayLog } | null>(null);

  // Generate last 16 weeks (112 days) for compact mobile fit
  const today = new Date();
  const startDate = subDays(today, 111);
  const dateRange = eachDayOfInterval({ start: startDate, end: today });

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  dateRange.forEach((d) => {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const cellSize = 11;
  const cellGap = 2.5;

  const getColor = (dayLog?: DayLog) => {
    if (!dayLog || dayLog.rating === 0) return 'var(--border-subtle)';
    if (dayLog.rating <= 2.5) return 'rgba(255, 204, 0, 0.3)';
    if (dayLog.rating <= 4.0) return 'rgba(255, 204, 0, 0.65)';
    return '#ffcc00'; // 4.5-5.0 gold
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="w-full overflow-x-auto pb-1 flex justify-center">
        <svg
          width={weeks.length * (cellSize + cellGap)}
          height={7 * (cellSize + cellGap)}
          className="overflow-visible"
        >
          {weeks.map((week, wIdx) => (
            <g key={wIdx} transform={`translate(${wIdx * (cellSize + cellGap)}, 0)`}>
              {week.map((date, dIdx) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const matchedDay = days.find((d) => {
                  try {
                    return isSameDay(parseISO(d.id), date);
                  } catch {
                    return false;
                  }
                });

                const fillColor = getColor(matchedDay);

                return (
                  <rect
                    key={dateStr}
                    y={dIdx * (cellSize + cellGap)}
                    width={cellSize}
                    height={cellSize}
                    rx={2.5}
                    fill={fillColor}
                    className="cursor-pointer transition-transform hover:scale-125 origin-center"
                    onMouseEnter={() => setHoveredInfo({ date: dateStr, day: matchedDay })}
                    onMouseLeave={() => setHoveredInfo(null)}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Info Display / Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 w-full text-[10px] font-mono text-theme-muted border-t border-theme-subtle pt-1.5">
        <div className="h-4">
          {hoveredInfo ? (
            <span>
              <strong className="text-theme-primary">{hoveredInfo.date}</strong>
              {hoveredInfo.day ? (
                <>: {hoveredInfo.day.title || 'Logged Day'} ({hoveredInfo.day.rating.toFixed(1)}★)</>
              ) : (
                <>: No entry</>
              )}
            </span>
          ) : (
            <span>Tap a day to inspect</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-theme-elevated/40" />
          <div className="w-2.5 h-2.5 rounded bg-[#ffcc00]/30" />
          <div className="w-2.5 h-2.5 rounded bg-[#ffcc00]/65" />
          <div className="w-2.5 h-2.5 rounded bg-[#ffcc00]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
