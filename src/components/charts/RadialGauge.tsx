import React from 'react';

interface RadialGaugeProps {
  value: number; // e.g. 4.2
  max?: number; // 5.0
  size?: number; // px diameter
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  max = 5.0,
  size = 120,
  strokeWidth = 8,
  label = 'AVG RATING',
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <defs>
          <linearGradient id="radialGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffcc00" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-theme-elevated/40 fill-none"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#radialGold)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="fill-none transition-all duration-700 ease-out"
        />
      </svg>

      {/* Central Metric */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-xl font-bold font-sans tracking-tight text-theme-primary">
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
        <span className="text-[8px] font-mono tracking-widest text-[#ffcc00] uppercase font-bold mt-0.5">
          {label}
        </span>
        {sublabel && <span className="text-[8px] font-mono text-theme-muted">{sublabel}</span>}
      </div>
    </div>
  );
};
