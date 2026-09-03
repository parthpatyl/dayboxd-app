import React from 'react';
import { DayOfWeekId } from '../../types';

export function getDayTemplateSvgString(
  dayOfWeek: DayOfWeekId,
  title?: string,
  dateStr?: string
): string {
  const safeTitle = title
    ? (title.length > 22 ? title.slice(0, 20) + '…' : title)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    : '';

  switch (dayOfWeek) {
    case 'mon':
      return `<svg viewBox="0 0 300 450" width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="450" fill="#0c0d10" />
        <circle cx="240" cy="80" r="100" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" fill="none" />
        <circle cx="240" cy="80" r="60" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6 6" fill="none" />
        <line x1="140" y1="80" x2="340" y2="80" stroke="rgba(255,255,255,0.04)" />
        <line x1="240" y1="-20" x2="240" y2="180" stroke="rgba(255,255,255,0.04)" />
        <text x="24" y="44" fill="#8e8e93" font-size="10" font-family="monospace" letter-spacing="3" font-weight="bold">DAYBOXD REEL • 01</text>
        <text x="24" y="62" fill="#545458" font-size="11" font-family="sans-serif" letter-spacing="1" font-weight="600">ACT I: THE GENESIS</text>
        <text x="150" y="235" fill="#ffffff" font-size="68" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-2">MON</text>
        <line x1="120" y1="260" x2="180" y2="260" stroke="#ffffff" stroke-width="2" opacity="0.4" />
        <text x="150" y="285" fill="#8e8e93" font-size="12" font-family="sans-serif" letter-spacing="4" text-anchor="middle">THE OPENING ACT</text>
        <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
        <text x="24" y="424" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold">${safeTitle || 'A New Week'}</text>
        <text x="276" y="424" fill="#8e8e93" font-size="11" font-family="monospace" text-anchor="end">${dateStr || '24 FPS'}</text>
      </svg>`;

    case 'tue':
      return `<svg viewBox="0 0 300 450" width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a1214" />
            <stop offset="50%" stop-color="#0e1b1c" />
            <stop offset="100%" stop-color="#080c0e" />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#tueGrad)" />
        <line x1="0" y1="120" x2="300" y2="220" stroke="rgba(45,212,191,0.12)" stroke-width="1" />
        <line x1="0" y1="180" x2="300" y2="280" stroke="rgba(45,212,191,0.12)" stroke-width="1" />
        <circle cx="150" cy="225" r="90" stroke="rgba(45,212,191,0.15)" stroke-width="1.5" fill="none" />
        <text x="24" y="44" fill="#2dd4bf" font-size="10" font-family="monospace" letter-spacing="3" font-weight="bold">MOMENTUM PASS</text>
        <text x="276" y="44" fill="#5eead4" font-size="10" font-family="monospace" text-anchor="end">SCENE 02</text>
        <text x="150" y="240" fill="#2dd4bf" font-size="68" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-2">TUE</text>
        <text x="150" y="275" fill="#ccfbf1" font-size="14" font-family="serif" font-style="italic" text-anchor="middle" opacity="0.85">Steady Cadence</text>
        <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(45,212,191,0.2)" stroke-width="1" />
        <text x="24" y="424" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold">${safeTitle || 'In Motion'}</text>
        <text x="276" y="424" fill="#2dd4bf" font-size="11" font-family="monospace" text-anchor="end">${dateStr || 'ISO 800'}</text>
      </svg>`;

    case 'wed':
      return `<svg viewBox="0 0 300 450" width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#140d1e" />
            <stop offset="100%" stop-color="#080c14" />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#wedGrad)" />
        <circle cx="60" cy="380" r="100" fill="rgba(168,85,247,0.15)" />
        <circle cx="240" cy="80" r="100" fill="rgba(6,182,212,0.15)" />
        <text x="24" y="44" fill="#c084fc" font-size="10" font-family="monospace" letter-spacing="3" font-weight="bold">MIDPOINT TWIST</text>
        <text x="276" y="44" fill="#67e8f9" font-size="10" font-family="monospace" text-anchor="end">50% MARK</text>
        <text x="150" y="240" fill="#e9d5ff" font-size="68" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-2">WED</text>
        <text x="150" y="275" fill="#a855f7" font-size="11" font-family="sans-serif" letter-spacing="4" text-anchor="middle">THE FULCRUM</text>
        <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(168,85,247,0.2)" stroke-width="1" />
        <text x="24" y="424" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold">${safeTitle || 'Halfway Reel'}</text>
        <text x="276" y="424" fill="#c084fc" font-size="11" font-family="monospace" text-anchor="end">${dateStr || 'ACT II'}</text>
      </svg>`;

    case 'thu':
      return `<svg viewBox="0 0 300 450" width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="thuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1c1208" />
            <stop offset="100%" stop-color="#0d0804" />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#thuGrad)" />
        <polygon points="150,110 240,280 60,280" stroke="rgba(245,158,11,0.18)" stroke-width="1.5" fill="none" />
        <text x="24" y="44" fill="#fbbf24" font-size="10" font-family="monospace" letter-spacing="3" font-weight="bold">THE ASCENT</text>
        <text x="276" y="44" fill="#f59e0b" font-size="10" font-family="monospace" text-anchor="end">CHAPTER IV</text>
        <text x="150" y="240" fill="#fef3c7" font-size="68" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-2">THU</text>
        <text x="150" y="275" fill="#f59e0b" font-size="12" font-family="sans-serif" letter-spacing="4" text-anchor="middle">PRE-CLIMAX DRIVE</text>
        <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(245,158,11,0.2)" stroke-width="1" />
        <text x="24" y="424" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold">${safeTitle || 'Approaching Peak'}</text>
        <text x="276" y="424" fill="#fbbf24" font-size="11" font-family="monospace" text-anchor="end">${dateStr || 'GOLD 35MM'}</text>
      </svg>`;

    case 'fri':
      return `<svg viewBox="0 0 300 450" width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="friGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1a0a14" />
            <stop offset="100%" stop-color="#080206" />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#friGrad)" />
        <circle cx="150" cy="225" r="85" fill="rgba(244,63,94,0.12)" />
        <circle cx="150" cy="225" r="115" stroke="rgba(244,63,94,0.2)" stroke-width="1" stroke-dasharray="4 8" fill="none" />
        <text x="24" y="44" fill="#fb7185" font-size="10" font-family="monospace" letter-spacing="3" font-weight="bold">FRIDAY NIGHT FEVER</text>
        <text x="276" y="44" fill="#f43f5e" font-size="10" font-family="monospace" text-anchor="end">CLIMAX</text>
        <text x="150" y="240" fill="#ffe4e6" font-size="68" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-2">FRI</text>
        <text x="150" y="275" fill="#f43f5e" font-size="12" font-family="sans-serif" letter-spacing="4" text-anchor="middle">CURTAIN RELEASE</text>
        <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(244,63,94,0.2)" stroke-width="1" />
        <text x="24" y="424" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold">${safeTitle || 'Weekend Gateway'}</text>
        <text x="276" y="424" fill="#fb7185" font-size="11" font-family="monospace" text-anchor="end">${dateStr || 'NEON RED'}</text>
      </svg>`;

    case 'sat':
      return `<svg viewBox="0 0 300 450" width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="satGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#141416" />
            <stop offset="100%" stop-color="#08080a" />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#satGrad)" />
        <rect x="50" y="125" width="200" height="200" stroke="rgba(255,255,255,0.08)" stroke-width="1" fill="none" />
        <rect x="75" y="150" width="150" height="150" stroke="rgba(255,255,255,0.05)" stroke-width="1" fill="none" />
        <text x="24" y="44" fill="#e5e5ea" font-size="10" font-family="monospace" letter-spacing="3" font-weight="bold">CRITERION EDITION</text>
        <text x="276" y="44" fill="#8e8e93" font-size="10" font-family="monospace" text-anchor="end">UNSCRIPTED</text>
        <text x="150" y="240" fill="#ffffff" font-size="68" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-2">SAT</text>
        <text x="150" y="275" fill="#8e8e93" font-size="13" font-family="serif" font-style="italic" text-anchor="middle">Pure Cinema</text>
        <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <text x="24" y="424" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold">${safeTitle || 'The Golden Hour'}</text>
        <text x="276" y="424" fill="#8e8e93" font-size="11" font-family="monospace" text-anchor="end">${dateStr || 'DIRECTOR CUT'}</text>
      </svg>`;

    case 'sun':
    default:
      return `<svg viewBox="0 0 300 450" width="300" height="450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18120c" />
            <stop offset="100%" stop-color="#0a0806" />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#sunGrad)" />
        <circle cx="150" cy="225" r="95" stroke="rgba(251,191,36,0.15)" stroke-width="1.5" fill="none" />
        <circle cx="150" cy="225" r="70" stroke="rgba(251,191,36,0.08)" stroke-width="1" stroke-dasharray="5 5" fill="none" />
        <text x="24" y="44" fill="#fde68a" font-size="10" font-family="monospace" letter-spacing="3" font-weight="bold">SUNDAY SOLITUDE</text>
        <text x="276" y="44" fill="#d97706" font-size="10" font-family="monospace" text-anchor="end">EPILOGUE</text>
        <text x="150" y="240" fill="#fef3c7" font-size="68" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-2">SUN</text>
        <text x="150" y="275" fill="#f59e0b" font-size="13" font-family="serif" font-style="italic" text-anchor="middle">Reverie & Rest</text>
        <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(245,158,11,0.2)" stroke-width="1" />
        <text x="24" y="424" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold">${safeTitle || 'The Epilogue'}</text>
        <text x="276" y="424" fill="#fde68a" font-size="11" font-family="monospace" text-anchor="end">${dateStr || 'FIN'}</text>
      </svg>`;
  }
}

interface DayTemplateProps {
  dayOfWeek: DayOfWeekId;
  title?: string;
  dateStr?: string;
  rating?: number;
  className?: string;
}

export const DayTemplatePoster: React.FC<DayTemplateProps> = ({
  dayOfWeek,
  title,
  dateStr,
  className = '',
}) => {
  switch (dayOfWeek) {
    case 'mon':
      return (
        <svg
          viewBox="0 0 300 450"
          className={`w-full h-full select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width="300" height="450" fill="#0c0d10" />
          
          {/* Graphic Elements */}
          <circle cx="240" cy="80" r="100" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" />
          <circle cx="240" cy="80" r="60" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="6 6" fill="none" />
          <line x1="140" y1="80" x2="340" y2="80" stroke="rgba(255,255,255,0.04)" />
          <line x1="240" y1="-20" x2="240" y2="180" stroke="rgba(255,255,255,0.04)" />

          {/* Header */}
          <text x="24" y="44" fill="#8e8e93" fontSize="10" fontFamily="monospace" letterSpacing="3" fontWeight="bold">DAYBOXD REEL • 01</text>
          <text x="24" y="62" fill="#545458" fontSize="11" fontFamily="sans-serif" letterSpacing="1" fontWeight="600">ACT I: THE GENESIS</text>

          {/* Centerpiece */}
          <text x="150" y="235" fill="#ffffff" fontSize="68" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-2">MON</text>
          <line x1="120" y1="260" x2="180" y2="260" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
          <text x="150" y="285" fill="#8e8e93" fontSize="12" fontFamily="sans-serif" letterSpacing="4" textAnchor="middle">THE OPENING ACT</text>

          {/* Footer */}
          <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <text x="24" y="424" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
            {title ? (title.length > 22 ? title.slice(0, 20) + '…' : title) : 'A New Week'}
          </text>
          <text x="276" y="424" fill="#8e8e93" fontSize="11" fontFamily="monospace" textAnchor="end">{dateStr || '24 FPS'}</text>
        </svg>
      );

    case 'tue':
      return (
        <svg
          viewBox="0 0 300 450"
          className={`w-full h-full select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Gradient */}
          <defs>
            <linearGradient id="tueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a1214" />
              <stop offset="50%" stopColor="#0e1b1c" />
              <stop offset="100%" stopColor="#080c0e" />
            </linearGradient>
          </defs>
          <rect width="300" height="450" fill="url(#tueGrad)" />

          {/* Dynamic Vector Lines */}
          <line x1="0" y1="120" x2="300" y2="220" stroke="rgba(45,212,191,0.12)" strokeWidth="1" />
          <line x1="0" y1="180" x2="300" y2="280" stroke="rgba(45,212,191,0.12)" strokeWidth="1" />
          <circle cx="150" cy="225" r="90" stroke="rgba(45,212,191,0.15)" strokeWidth="1.5" fill="none" />

          {/* Header */}
          <text x="24" y="44" fill="#2dd4bf" fontSize="10" fontFamily="monospace" letterSpacing="3" fontWeight="bold">MOMENTUM PASS</text>
          <text x="276" y="44" fill="#5eead4" fontSize="10" fontFamily="monospace" textAnchor="end">SCENE 02</text>

          {/* Centerpiece */}
          <text x="150" y="240" fill="#2dd4bf" fontSize="68" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-2">TUE</text>
          <text x="150" y="275" fill="#ccfbf1" fontSize="14" fontFamily="serif" fontStyle="italic" textAnchor="middle" opacity="0.85">Steady Cadence</text>

          {/* Footer */}
          <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(45,212,191,0.2)" strokeWidth="1" />
          <text x="24" y="424" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
            {title ? (title.length > 22 ? title.slice(0, 20) + '…' : title) : 'In Motion'}
          </text>
          <text x="276" y="424" fill="#2dd4bf" fontSize="11" fontFamily="monospace" textAnchor="end">{dateStr || 'ISO 800'}</text>
        </svg>
      );

    case 'wed':
      return (
        <svg
          viewBox="0 0 300 450"
          className={`w-full h-full select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#140d1e" />
              <stop offset="100%" stopColor="#080c14" />
            </linearGradient>
          </defs>
          <rect width="300" height="450" fill="url(#wedGrad)" />

          <circle cx="60" cy="380" r="100" fill="rgba(168,85,247,0.15)" filter="blur(20px)" />
          <circle cx="240" cy="80" r="100" fill="rgba(6,182,212,0.15)" filter="blur(20px)" />

          <text x="24" y="44" fill="#c084fc" fontSize="10" fontFamily="monospace" letterSpacing="3" fontWeight="bold">MIDPOINT TWIST</text>
          <text x="276" y="44" fill="#67e8f9" fontSize="10" fontFamily="monospace" textAnchor="end">50% MARK</text>

          <text x="150" y="240" fill="#e9d5ff" fontSize="68" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-2">WED</text>
          <text x="150" y="275" fill="#a855f7" fontSize="11" fontFamily="sans-serif" letterSpacing="4" textAnchor="middle">THE FULCRUM</text>

          <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(168,85,247,0.2)" strokeWidth="1" />
          <text x="24" y="424" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
            {title ? (title.length > 22 ? title.slice(0, 20) + '…' : title) : 'Halfway Reel'}
          </text>
          <text x="276" y="424" fill="#c084fc" fontSize="11" fontFamily="monospace" textAnchor="end">{dateStr || 'ACT II'}</text>
        </svg>
      );

    case 'thu':
      return (
        <svg
          viewBox="0 0 300 450"
          className={`w-full h-full select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="thuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1c1208" />
              <stop offset="100%" stopColor="#0d0804" />
            </linearGradient>
          </defs>
          <rect width="300" height="450" fill="url(#thuGrad)" />

          <polygon points="150,110 240,280 60,280" stroke="rgba(245,158,11,0.18)" strokeWidth="1.5" fill="none" />

          <text x="24" y="44" fill="#fbbf24" fontSize="10" fontFamily="monospace" letterSpacing="3" fontWeight="bold">THE ASCENT</text>
          <text x="276" y="44" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="end">CHAPTER IV</text>

          <text x="150" y="240" fill="#fef3c7" fontSize="68" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-2">THU</text>
          <text x="150" y="275" fill="#f59e0b" fontSize="12" fontFamily="sans-serif" letterSpacing="4" textAnchor="middle">PRE-CLIMAX DRIVE</text>

          <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
          <text x="24" y="424" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
            {title ? (title.length > 22 ? title.slice(0, 20) + '…' : title) : 'Approaching Peak'}
          </text>
          <text x="276" y="424" fill="#fbbf24" fontSize="11" fontFamily="monospace" textAnchor="end">{dateStr || 'GOLD 35MM'}</text>
        </svg>
      );

    case 'fri':
      return (
        <svg
          viewBox="0 0 300 450"
          className={`w-full h-full select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="friGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a0a14" />
              <stop offset="100%" stopColor="#080206" />
            </linearGradient>
          </defs>
          <rect width="300" height="450" fill="url(#friGrad)" />

          <circle cx="150" cy="225" r="85" fill="rgba(244,63,94,0.12)" />
          <circle cx="150" cy="225" r="115" stroke="rgba(244,63,94,0.2)" strokeWidth="1" strokeDasharray="4 8" fill="none" />

          <text x="24" y="44" fill="#fb7185" fontSize="10" fontFamily="monospace" letterSpacing="3" fontWeight="bold">FRIDAY NIGHT FEVER</text>
          <text x="276" y="44" fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="end">CLIMAX</text>

          <text x="150" y="240" fill="#ffe4e6" fontSize="68" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-2">FRI</text>
          <text x="150" y="275" fill="#f43f5e" fontSize="12" fontFamily="sans-serif" letterSpacing="4" textAnchor="middle">CURTAIN RELEASE</text>

          <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(244,63,94,0.2)" strokeWidth="1" />
          <text x="24" y="424" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
            {title ? (title.length > 22 ? title.slice(0, 20) + '…' : title) : 'Weekend Gateway'}
          </text>
          <text x="276" y="424" fill="#fb7185" fontSize="11" fontFamily="monospace" textAnchor="end">{dateStr || 'NEON RED'}</text>
        </svg>
      );

    case 'sat':
      return (
        <svg
          viewBox="0 0 300 450"
          className={`w-full h-full select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="satGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#141416" />
              <stop offset="100%" stopColor="#08080a" />
            </linearGradient>
          </defs>
          <rect width="300" height="450" fill="url(#satGrad)" />

          <rect x="50" y="125" width="200" height="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
          <rect x="75" y="150" width="150" height="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />

          <text x="24" y="44" fill="#e5e5ea" fontSize="10" fontFamily="monospace" letterSpacing="3" fontWeight="bold">CRITERION EDITION</text>
          <text x="276" y="44" fill="#8e8e93" fontSize="10" fontFamily="monospace" textAnchor="end">UNSCRIPTED</text>

          <text x="150" y="240" fill="#ffffff" fontSize="68" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-2">SAT</text>
          <text x="150" y="275" fill="#8e8e93" fontSize="13" fontFamily="serif" fontStyle="italic" textAnchor="middle">Pure Cinema</text>

          <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <text x="24" y="424" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
            {title ? (title.length > 22 ? title.slice(0, 20) + '…' : title) : 'The Golden Hour'}
          </text>
          <text x="276" y="424" fill="#8e8e93" fontSize="11" fontFamily="monospace" textAnchor="end">{dateStr || 'DIRECTOR CUT'}</text>
        </svg>
      );

    case 'sun':
    default:
      return (
        <svg
          viewBox="0 0 300 450"
          className={`w-full h-full select-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#18120c" />
              <stop offset="100%" stopColor="#0a0806" />
            </linearGradient>
          </defs>
          <rect width="300" height="450" fill="url(#sunGrad)" />

          <circle cx="150" cy="225" r="95" stroke="rgba(251,191,36,0.15)" strokeWidth="1.5" fill="none" />
          <circle cx="150" cy="225" r="70" stroke="rgba(251,191,36,0.08)" strokeWidth="1" strokeDasharray="5 5" fill="none" />

          <text x="24" y="44" fill="#fde68a" fontSize="10" fontFamily="monospace" letterSpacing="3" fontWeight="bold">SUNDAY SOLITUDE</text>
          <text x="276" y="44" fill="#d97706" fontSize="10" fontFamily="monospace" textAnchor="end">EPILOGUE</text>

          <text x="150" y="240" fill="#fef3c7" fontSize="68" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" letterSpacing="-2">SUN</text>
          <text x="150" y="275" fill="#f59e0b" fontSize="13" fontFamily="serif" fontStyle="italic" textAnchor="middle">Reverie & Rest</text>

          <line x1="24" y1="400" x2="276" y2="400" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
          <text x="24" y="424" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
            {title ? (title.length > 22 ? title.slice(0, 20) + '…' : title) : 'The Epilogue'}
          </text>
          <text x="276" y="424" fill="#fde68a" fontSize="11" fontFamily="monospace" textAnchor="end">{dateStr || 'FIN'}</text>
        </svg>
      );
  }
};
