import React, { useState } from 'react';

interface StarRatingProps {
  value: number; // 0 to 5 in 0.5 increments
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  readOnly?: boolean;
  showLabel?: boolean;
  className?: string;
  id?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  showLabel = false,
  className = '',
  id,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayRating = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8',
  };

  const handleMouseMove = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    const computedVal = isLeftHalf ? starIndex - 0.5 : starIndex;
    setHoverValue(computedVal);
  };

  const handleClick = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    const clickedVal = isLeftHalf ? starIndex - 0.5 : starIndex;

    // Toggle off if clicking same value
    if (value === clickedVal) {
      onChange(0);
    } else {
      onChange(clickedVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly || !onChange) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(5, Math.round((value + 0.5) * 2) / 2);
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(0, Math.round((value - 0.5) * 2) / 2);
      onChange(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(5.0);
    }
  };

  return (
    <div
      id={id}
      role={readOnly ? 'img' : 'slider'}
      aria-label="Rating"
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={value}
      aria-valuetext={value > 0 ? `${value.toFixed(1)} stars out of 5` : 'No rating'}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center gap-2.5 select-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:outline-none rounded-xl p-1 -m-1 min-h-[44px] ${className}`}
    >
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => !readOnly && setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = displayRating >= starIndex;
          const isHalf = !isFull && displayRating >= starIndex - 0.5;

          return (
            <button
              type="button"
              key={starIndex}
              tabIndex={-1}
              aria-hidden="true"
              disabled={readOnly}
              className={`relative flex items-center justify-center p-0.5 rounded-lg transition-transform duration-150 ${
                readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95 cursor-pointer'
              } ${sizeClasses[size]}`}
              onMouseMove={(e) => handleMouseMove(starIndex, e)}
              onClick={(e) => handleClick(starIndex, e)}
            >
              {/* Star Background Outline */}
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-theme-muted/40 fill-transparent stroke-current stroke-[1.5]"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>

              {/* Full Star Active Fill */}
              {isFull && (
                <svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0.5 w-[calc(100%-4px)] h-[calc(100%-4px)] text-[#ffcc00] fill-[#ffcc00] stroke-[#ffcc00] stroke-[1]"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}

              {/* Half Star Active Fill */}
              {isHalf && (
                <svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0.5 w-[calc(100%-4px)] h-[calc(100%-4px)] text-[#ffcc00] stroke-[#ffcc00] stroke-[1]"
                >
                  <defs>
                    <linearGradient id={`halfGrad_${starIndex}`}>
                      <stop offset="50%" stopColor="#ffcc00" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={`url(#halfGrad_${starIndex})`}
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-xs sm:text-sm font-mono font-bold text-theme-primary min-w-[2.5rem]">
          {displayRating > 0 ? `${displayRating.toFixed(1)} ★` : '—'}
        </span>
      )}
    </div>
  );
};
