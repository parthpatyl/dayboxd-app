import React, { useState } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerSegmentedProps {
  value: string; // 'HH:mm' e.g. '21:30'
  onChange: (time: string) => void;
  className?: string;
}

export const TimePickerSegmented: React.FC<TimePickerSegmentedProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse hour and minute safely
  const parts = (value || '12:00').split(':');
  let currentHours = parseInt(parts[0], 10);
  let currentMinutes = parseInt(parts[1], 10);

  if (isNaN(currentHours)) currentHours = 12;
  if (isNaN(currentMinutes)) currentMinutes = 0;

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  const updateTime = (h: number, m: number) => {
    const normalizedH = (h + 24) % 24;
    const normalizedM = (m + 60) % 60;
    onChange(`${format2Digits(normalizedH)}:${format2Digits(normalizedM)}`);
  };

  const handleHourStep = (delta: number) => {
    updateTime(currentHours + delta, currentMinutes);
  };

  const handleMinuteStep = (delta: number) => {
    updateTime(currentHours, currentMinutes + delta);
  };

  // 12-hour AM/PM display conversion
  const isPM = currentHours >= 12;
  const display12H = currentHours % 12 === 0 ? 12 : currentHours % 12;
  const ampm = isPM ? 'PM' : 'AM';

  const PRESETS = [
    { label: 'Now', getTime: () => {
      const now = new Date();
      return `${format2Digits(now.getHours())}:${format2Digits(now.getMinutes())}`;
    }},
    { label: 'Morning', time: '09:00' },
    { label: 'Afternoon', time: '14:00' },
    { label: 'Evening', time: '20:00' },
    { label: 'Night', time: '22:30' },
  ];

  return (
    <div className={`relative select-none ${className}`}>
      {/* Compact Tactile Time Display Button */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-theme-input border border-theme-subtle text-theme-primary hover:border-theme-strong text-xs font-mono transition-all active:scale-95 shadow-xs"
        >
          <Clock className="w-3.5 h-3.5 text-theme-secondary" />
          <span className="font-bold text-sm">
            {format2Digits(currentHours)}:{format2Digits(currentMinutes)}
          </span>
          <span className="text-[10px] text-theme-muted font-sans font-medium">
            ({display12H}:{format2Digits(currentMinutes)} {ampm})
          </span>
        </button>

        {/* Quick Tap Presets */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono scrollbar-none">
          {PRESETS.map((p) => {
            const presetTime = p.time || p.getTime?.();
            const isActive = presetTime === value;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  if (p.getTime) {
                    onChange(p.getTime());
                  } else if (p.time) {
                    onChange(p.time);
                  }
                }}
                className={`px-2 py-1 rounded-md transition-all active:scale-95 ${
                  isActive
                    ? 'bg-theme-primary text-theme-primary border border-theme-primary font-bold shadow-xs'
                    : 'bg-theme-elevated text-theme-secondary hover:text-theme-primary border border-theme-subtle'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modern Segmented Stepper / Grid Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-3 rounded-xl bg-theme-surface border border-theme-subtle shadow-xl space-y-3 w-64 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-2">
            <span className="text-[11px] font-mono uppercase text-theme-muted font-bold">
              Adjust Time (24h)
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-theme-secondary hover:text-theme-primary font-bold"
            >
              Done
            </button>
          </div>

          {/* Stepper Columns: Hours & Minutes */}
          <div className="flex items-center justify-center gap-4 py-1">
            {/* Hours Column */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => handleHourStep(1)}
                className="p-1 rounded-md bg-theme-elevated hover:brightness-110 text-theme-primary transition-all active:scale-90"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div className="w-12 h-10 rounded-lg bg-theme-input border border-theme-subtle flex items-center justify-center text-base font-mono font-bold text-theme-primary">
                {format2Digits(currentHours)}
              </div>
              <button
                type="button"
                onClick={() => handleHourStep(-1)}
                className="p-1 rounded-md bg-theme-elevated hover:brightness-110 text-theme-primary transition-all active:scale-90"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <span className="text-[9px] font-mono text-theme-muted uppercase">Hours</span>
            </div>

            <span className="text-xl font-mono font-bold text-theme-muted pb-4">:</span>

            {/* Minutes Column */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => handleMinuteStep(5)}
                className="p-1 rounded-md bg-theme-elevated hover:brightness-110 text-theme-primary transition-all active:scale-90"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div className="w-12 h-10 rounded-lg bg-theme-input border border-theme-subtle flex items-center justify-center text-base font-mono font-bold text-theme-primary">
                {format2Digits(currentMinutes)}
              </div>
              <button
                type="button"
                onClick={() => handleMinuteStep(-5)}
                className="p-1 rounded-md bg-theme-elevated hover:brightness-110 text-theme-primary transition-all active:scale-90"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <span className="text-[9px] font-mono text-theme-muted uppercase">Minutes</span>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex flex-col gap-1 pb-4">
              <button
                type="button"
                onClick={() => {
                  if (currentHours >= 12) updateTime(currentHours - 12, currentMinutes);
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  !isPM
                    ? 'bg-theme-primary text-theme-primary'
                    : 'bg-theme-elevated text-theme-muted hover:text-theme-primary'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentHours < 12) updateTime(currentHours + 12, currentMinutes);
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  isPM
                    ? 'bg-theme-primary text-theme-primary'
                    : 'bg-theme-elevated text-theme-muted hover:text-theme-primary'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Quick Minute Jumps */}
          <div className="grid grid-cols-4 gap-1 pt-1 border-t border-theme-subtle text-[10px] font-mono">
            {[':00', ':15', ':30', ':45'].map((minStr, idx) => (
              <button
                key={minStr}
                type="button"
                onClick={() => updateTime(currentHours, idx * 15)}
                className="py-1 rounded bg-theme-elevated text-theme-secondary hover:text-theme-primary text-center"
              >
                {minStr}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
