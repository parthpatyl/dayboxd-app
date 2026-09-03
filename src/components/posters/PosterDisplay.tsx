import React from 'react';
import { DayLog, DayOfWeekId } from '../../types';
import { DayTemplatePoster } from './DayTemplates';
import { getDayOfWeekTemplateId } from '../../lib/format';
import { getCachedDisplayUrl } from '../../lib/imageStorage';

interface PosterDisplayProps {
  day?: Partial<DayLog>;
  dayOfWeek?: DayOfWeekId;
  title?: string;
  dateStr?: string;
  className?: string;
  showOverlay?: boolean;
}

export const PosterDisplay: React.FC<PosterDisplayProps> = ({
  day,
  dayOfWeek,
  title,
  dateStr,
  className = '',
  showOverlay = false,
}) => {
  const isCustom = day?.posterType === 'custom' && !!day?.posterImage;
  const templateId = day?.posterTemplateId || dayOfWeek || (day?.id ? getDayOfWeekTemplateId(day.id) : 'mon');
  const displayTitle = title || day?.title || '';
  const displayDate = dateStr || day?.id || '';
  const posterSrc = isCustom ? getCachedDisplayUrl(day?.posterImage) : null;

  return (
    <div className={`relative aspect-poster w-full rounded-xl overflow-hidden shadow-lg group bg-black/40 border border-white/10 ${className}`}>
      {isCustom && posterSrc ? (
        <img
          src={posterSrc}
          alt={displayTitle || 'Day Poster'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <DayTemplatePoster
          dayOfWeek={templateId}
          title={displayTitle}
          dateStr={displayDate}
          rating={day?.rating}
        />
      )}

      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white pointer-events-none">
          <div className="text-xs font-bold line-clamp-1">{displayTitle || 'Untitled Day'}</div>
          {day?.rating && day.rating > 0 ? (
            <div className="text-[11px] text-[#00e054] font-semibold mt-0.5">★ {day.rating.toFixed(1)}</div>
          ) : null}
        </div>
      )}
    </div>
  );
};
