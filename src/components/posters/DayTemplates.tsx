import React from 'react';
import { DayOfWeekId } from '../../types';

/* ------------------------------------------------------------------ */
/*  Theme tokens                                                       */
/* ------------------------------------------------------------------ */

export type PosterTheme = 'dark' | 'light';

interface ThemeTokens {
  bg: string;
  cardBorder: string;
  patternStroke: string;
  patternFill: string;
  hairline: string;
  badgeBg: string;
  badgeText: string;
  dayText: string;
  metaDim: string;
  rule: string;
  accent: string;
}

const THEME: Record<PosterTheme, ThemeTokens> = {
  dark: {
    bg: '#0c0d10',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    patternStroke: 'rgba(255, 255, 255, 0.09)',
    patternFill: 'rgba(255, 255, 255, 0.16)',
    hairline: 'rgba(255, 255, 255, 0.15)',
    badgeBg: 'rgba(255, 255, 255, 0.08)',
    badgeText: '#a1a1aa',
    dayText: '#f4f4f5',
    metaDim: '#8e8e93',
    rule: 'rgba(255, 255, 255, 0.18)',
    accent: '#00e054', // Letterboxd green subtle accent dot
  },
  light: {
    bg: '#f8f7f4',
    cardBorder: 'rgba(0, 0, 0, 0.12)',
    patternStroke: 'rgba(0, 0, 0, 0.08)',
    patternFill: 'rgba(0, 0, 0, 0.14)',
    hairline: 'rgba(0, 0, 0, 0.12)',
    badgeBg: 'rgba(0, 0, 0, 0.05)',
    badgeText: '#52525b',
    dayText: '#18181b',
    metaDim: '#6b6a66',
    rule: 'rgba(0, 0, 0, 0.15)',
    accent: '#00b344',
  },
};

export interface DayDesign {
  id: DayOfWeekId;
  index: string; // "№ 01"
  dayName: string; // "MONDAY"
  act: string; // "ACT I"
  patternType: 'grid' | 'dots' | 'stripes' | 'isometric' | 'cross' | 'waves' | 'concentric';
  graphic: (t: ThemeTokens, uid: string) => string;
}

const DAYS: Record<DayOfWeekId, DayDesign> = {
  mon: {
    id: 'mon',
    index: '№ 01',
    dayName: 'MONDAY',
    act: 'ACT I',
    patternType: 'dots',
    graphic: (t, uid) => `
      <rect x="24" y="76" width="252" height="210" rx="8" fill="url(#pat_${uid})" />
      <rect x="24" y="76" width="252" height="210" rx="8" stroke="${t.hairline}" stroke-width="1" fill="none" />
      <circle cx="150" cy="181" r="60" fill="${t.bg}" stroke="${t.dayText}" stroke-width="2.5" />
      <circle cx="150" cy="181" r="46" fill="${t.patternFill}" />
      <path d="M 112,181 L 188,181" stroke="${t.dayText}" stroke-width="2" stroke-linecap="round" />
      <path d="M 150,143 L 150,219" stroke="${t.dayText}" stroke-width="2" stroke-linecap="round" />
      <circle cx="150" cy="181" r="7" fill="${t.accent}" />
    `,
  },
  tue: {
    id: 'tue',
    index: '№ 02',
    dayName: 'TUESDAY',
    act: 'ACT II',
    patternType: 'stripes',
    graphic: (t, uid) => `
      <rect x="24" y="76" width="252" height="210" rx="8" fill="url(#pat_${uid})" />
      <rect x="24" y="76" width="252" height="210" rx="8" stroke="${t.hairline}" stroke-width="1" fill="none" />
      <rect x="90" y="122" width="88" height="115" rx="6" fill="${t.bg}" stroke="${t.dayText}" stroke-width="2.5" />
      <rect x="122" y="137" width="88" height="100" rx="6" fill="${t.patternFill}" stroke="${t.hairline}" stroke-width="1.5" />
      <line x1="90" y1="181" x2="210" y2="181" stroke="${t.dayText}" stroke-width="2" stroke-dasharray="5 4" />
      <circle cx="134" cy="160" r="6" fill="${t.accent}" />
    `,
  },
  wed: {
    id: 'wed',
    index: '№ 03',
    dayName: 'WEDNESDAY',
    act: 'ACT III',
    patternType: 'cross',
    graphic: (t, uid) => `
      <rect x="24" y="76" width="252" height="210" rx="8" fill="url(#pat_${uid})" />
      <rect x="24" y="76" width="252" height="210" rx="8" stroke="${t.hairline}" stroke-width="1" fill="none" />
      <line x1="68" y1="186" x2="232" y2="186" stroke="${t.dayText}" stroke-width="3.5" stroke-linecap="round" />
      <polygon points="150,152 126,186 174,186" fill="${t.patternFill}" stroke="${t.dayText}" stroke-width="2" />
      <circle cx="90" cy="162" r="21" fill="${t.bg}" stroke="${t.dayText}" stroke-width="2.5" />
      <rect x="188" y="148" width="28" height="28" rx="4" fill="${t.dayText}" />
      <circle cx="90" cy="162" r="5" fill="${t.accent}" />
    `,
  },
  thu: {
    id: 'thu',
    index: '№ 04',
    dayName: 'THURSDAY',
    act: 'ACT IV',
    patternType: 'isometric',
    graphic: (t, uid) => `
      <rect x="24" y="76" width="252" height="210" rx="8" fill="url(#pat_${uid})" />
      <rect x="24" y="76" width="252" height="210" rx="8" stroke="${t.hairline}" stroke-width="1" fill="none" />
      <polygon points="150,114 224,158 150,202 76,158" fill="${t.bg}" stroke="${t.dayText}" stroke-width="2.5" />
      <polygon points="76,158 150,202 150,246 76,202" fill="${t.patternFill}" stroke="${t.dayText}" stroke-width="1.5" />
      <polygon points="224,158 150,202 150,246 224,202" fill="${t.dayText}" opacity="0.85" />
      <circle cx="150" cy="158" r="6" fill="${t.accent}" />
    `,
  },
  fri: {
    id: 'fri',
    index: '№ 05',
    dayName: 'FRIDAY',
    act: 'CLIMAX',
    patternType: 'concentric',
    graphic: (t, uid) => `
      <rect x="24" y="76" width="252" height="210" rx="8" fill="url(#pat_${uid})" />
      <rect x="24" y="76" width="252" height="210" rx="8" stroke="${t.hairline}" stroke-width="1" fill="none" />
      <circle cx="150" cy="181" r="68" stroke="${t.hairline}" stroke-width="1.2" stroke-dasharray="4 3" fill="none" />
      <circle cx="150" cy="181" r="50" stroke="${t.dayText}" stroke-width="2.5" fill="${t.bg}" />
      <circle cx="150" cy="181" r="32" fill="${t.patternFill}" stroke="${t.dayText}" stroke-width="1.5" />
      <circle cx="150" cy="181" r="11" fill="${t.accent}" />
    `,
  },
  sat: {
    id: 'sat',
    index: '№ 06',
    dayName: 'SATURDAY',
    act: 'GOLDEN HOUR',
    patternType: 'grid',
    graphic: (t, uid) => `
      <rect x="24" y="76" width="252" height="210" rx="8" fill="url(#pat_${uid})" />
      <rect x="24" y="76" width="252" height="210" rx="8" stroke="${t.hairline}" stroke-width="1" fill="none" />
      <rect x="80" y="125" width="98" height="98" rx="5" fill="${t.bg}" stroke="${t.dayText}" stroke-width="2.5" />
      <circle cx="174" cy="182" r="50" fill="${t.patternFill}" stroke="${t.dayText}" stroke-width="2.5" />
      <rect x="135" y="145" width="44" height="44" fill="${t.dayText}" />
      <circle cx="174" cy="182" r="6" fill="${t.accent}" />
    `,
  },
  sun: {
    id: 'sun',
    index: '№ 07',
    dayName: 'SUNDAY',
    act: 'EPILOGUE',
    patternType: 'waves',
    graphic: (t, uid) => `
      <rect x="24" y="76" width="252" height="210" rx="8" fill="url(#pat_${uid})" />
      <rect x="24" y="76" width="252" height="210" rx="8" stroke="${t.hairline}" stroke-width="1" fill="none" />
      <path d="M 82,212 A 68,68 0 0,1 218,212 Z" fill="${t.dayText}" />
      <circle cx="150" cy="165" r="35" fill="${t.bg}" stroke="${t.dayText}" stroke-width="2.5" />
      <line x1="50" y1="212" x2="250" y2="212" stroke="${t.dayText}" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="150" cy="165" r="8" fill="${t.accent}" />
    `,
  },
};

function renderPatternDef(patternType: DayDesign['patternType'], t: ThemeTokens, uid: string): string {
  switch (patternType) {
    case 'dots':
      return `
        <pattern id="pat_${uid}" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="1.5" fill="${t.patternStroke}" />
        </pattern>`;
    case 'stripes':
      return `
        <pattern id="pat_${uid}" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="16" stroke="${t.patternStroke}" stroke-width="2" />
        </pattern>`;
    case 'cross':
      return `
        <pattern id="pat_${uid}" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 9,5 L 9,13 M 5,9 L 13,9" stroke="${t.patternStroke}" stroke-width="1.2" stroke-linecap="round" />
        </pattern>`;
    case 'isometric':
      return `
        <pattern id="pat_${uid}" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 0,10 L 10,0 L 20,10 L 10,20 Z" fill="none" stroke="${t.patternStroke}" stroke-width="1" />
        </pattern>`;
    case 'concentric':
      return `
        <pattern id="pat_${uid}" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="7" fill="none" stroke="${t.patternStroke}" stroke-width="1" />
          <circle cx="10" cy="10" r="2" fill="${t.patternStroke}" />
        </pattern>`;
    case 'grid':
      return `
        <pattern id="pat_${uid}" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="${t.patternStroke}" stroke-width="1" />
        </pattern>`;
    case 'waves':
      return `
        <pattern id="pat_${uid}" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M 0,6 Q 6,0 12,6 T 24,6" fill="none" stroke="${t.patternStroke}" stroke-width="1.2" />
        </pattern>`;
  }
}

function truncateTitle(title?: string): string {
  return title ? (title.length > 24 ? title.slice(0, 22) + '…' : title) : '';
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ------------------------------------------------------------------ */
/*  1. String-based SVG generator (for Canvas / Tickets / Export)      */
/* ------------------------------------------------------------------ */

export function getDayTemplateSvgString(
  dayOfWeek: DayOfWeekId,
  title?: string,
  dateStr?: string,
  theme: PosterTheme = 'dark'
): string {
  const d = DAYS[dayOfWeek] || DAYS.mon;
  const t = THEME[theme];
  const uid = `${dayOfWeek}_${theme}`;
  const isCustomTitle = title && title.trim().length > 0 && title.trim().toLowerCase() !== d.dayName.toLowerCase();
  const safeCustomTitle = isCustomTitle ? escapeXml(truncateTitle(title)) : '';
  const safeDate = escapeXml(dateStr || '24 FPS');

  return `<svg viewBox="0 0 300 450" width="300" height="450" xmlns="http://www.w3.org/2000/svg">
    <defs>
      ${renderPatternDef(d.patternType, t, uid)}
      <filter id="grain_${uid}" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0" />
      </filter>
    </defs>

    <rect width="300" height="450" fill="${t.bg}" />
    <rect x="12" y="12" width="276" height="426" rx="12" fill="none" stroke="${t.cardBorder}" stroke-width="1" />

    <text x="26" y="44" fill="${t.badgeText}" font-size="10" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-weight="700" letter-spacing="2">${escapeXml(d.index)}</text>
    <rect x="76" y="34" width="60" height="15" rx="3" fill="${t.badgeBg}" />
    <text x="106" y="45" fill="${t.metaDim}" font-size="8.5" font-family="ui-monospace, monospace" font-weight="600" text-anchor="middle" letter-spacing="1.5">EDITION</text>
    <text x="274" y="44" fill="${t.metaDim}" font-size="9.5" font-family="ui-monospace, monospace" font-weight="600" text-anchor="end" letter-spacing="2">${escapeXml(d.act)}</text>

    ${d.graphic(t, uid)}

    <!-- Large Weekday typography -->
    <text x="24" y="338" fill="${t.dayText}" font-size="40" font-family="system-ui, -apple-system, sans-serif" font-weight="900" letter-spacing="-1">${escapeXml(d.dayName)}</text>

    <line x1="24" y1="365" x2="276" y2="365" stroke="${t.rule}" stroke-width="1" />

    <!-- Clean Footer without duplicate weekday -->
    ${
      isCustomTitle
        ? `
      <text x="24" y="392" fill="${t.metaDim}" font-size="11" font-family="ui-monospace, monospace" font-weight="700" letter-spacing="2">LOGGED ENTRY</text>
      <text x="24" y="416" fill="${t.dayText}" font-size="16" font-family="system-ui, -apple-system, sans-serif" font-weight="800" letter-spacing="0.2">${safeCustomTitle}</text>
      <text x="276" y="416" fill="${t.metaDim}" font-size="13" font-family="ui-monospace, monospace" font-weight="600" text-anchor="end">${safeDate}</text>
    `
        : `
      <text x="24" y="410" fill="${t.metaDim}" font-size="13" font-family="ui-monospace, monospace" font-weight="700" letter-spacing="2">ORIGINAL POSTER</text>
      <text x="276" y="410" fill="${t.metaDim}" font-size="13" font-family="ui-monospace, monospace" font-weight="600" text-anchor="end">${safeDate}</text>
    `
    }

    <rect width="300" height="450" filter="url(#grain_${uid})" opacity="0.7" pointer-events="none" />
  </svg>`;
}

/* ------------------------------------------------------------------ */
/*  2. React Component                                                 */
/* ------------------------------------------------------------------ */

export interface DayTemplateProps {
  dayOfWeek: DayOfWeekId;
  title?: string;
  dateStr?: string;
  rating?: number;
  className?: string;
  theme?: PosterTheme | 'auto';
}

function useResolvedTheme(theme: PosterTheme | 'auto'): PosterTheme {
  const getSystemTheme = (): PosterTheme => {
    if (typeof document !== 'undefined') {
      const dataTheme = document.documentElement.getAttribute('data-theme');
      if (dataTheme === 'light' || dataTheme === 'dark') return dataTheme;
    }
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  };

  const [currentTheme, setCurrentTheme] = React.useState<PosterTheme>(
    theme === 'auto' ? getSystemTheme() : theme
  );

  React.useEffect(() => {
    if (theme !== 'auto') {
      setCurrentTheme(theme);
      return;
    }

    const update = () => setCurrentTheme(getSystemTheme());
    update();

    const observer = new MutationObserver(update);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    const mq = window.matchMedia?.('(prefers-color-scheme: light)');
    mq?.addEventListener('change', update);

    return () => {
      observer.disconnect();
      mq?.removeEventListener('change', update);
    };
  }, [theme]);

  return currentTheme;
}

export const DayTemplatePoster: React.FC<DayTemplateProps> = ({
  dayOfWeek,
  title,
  dateStr,
  className = '',
  theme = 'auto',
}) => {
  const d = DAYS[dayOfWeek] || DAYS.mon;
  const resolvedTheme = useResolvedTheme(theme);
  const t = THEME[resolvedTheme];
  const uid = React.useId().replace(/[:]/g, '_');
  const isCustomTitle = Boolean(title && title.trim().length > 0 && title.trim().toLowerCase() !== d.dayName.toLowerCase());
  const safeCustomTitle = isCustomTitle ? truncateTitle(title) : '';
  const safeDate = dateStr || '24 FPS';

  return (
    <svg
      viewBox="0 0 300 450"
      className={`w-full h-full select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {d.patternType === 'dots' && (
          <pattern id={`pat_${uid}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.5" fill={t.patternStroke} />
          </pattern>
        )}
        {d.patternType === 'stripes' && (
          <pattern id={`pat_${uid}`} width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="16" stroke={t.patternStroke} strokeWidth="2" />
          </pattern>
        )}
        {d.patternType === 'cross' && (
          <pattern id={`pat_${uid}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M 9,5 L 9,13 M 5,9 L 13,9" stroke={t.patternStroke} strokeWidth="1.2" strokeLinecap="round" />
          </pattern>
        )}
        {d.patternType === 'isometric' && (
          <pattern id={`pat_${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0,10 L 10,0 L 20,10 L 10,20 Z" fill="none" stroke={t.patternStroke} strokeWidth="1" />
          </pattern>
        )}
        {d.patternType === 'concentric' && (
          <pattern id={`pat_${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="7" fill="none" stroke={t.patternStroke} strokeWidth="1" />
            <circle cx="10" cy="10" r="2" fill={t.patternStroke} />
          </pattern>
        )}
        {d.patternType === 'grid' && (
          <pattern id={`pat_${uid}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke={t.patternStroke} strokeWidth="1" />
          </pattern>
        )}
        {d.patternType === 'waves' && (
          <pattern id={`pat_${uid}`} width="24" height="12" patternUnits="userSpaceOnUse">
            <path d="M 0,6 Q 6,0 12,6 T 24,6" fill="none" stroke={t.patternStroke} strokeWidth="1.2" />
          </pattern>
        )}
        <filter id={`react_grain_${uid}`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0" />
        </filter>
      </defs>

      <rect width="300" height="450" fill={t.bg} />
      <rect x="12" y="12" width="276" height="426" rx="12" fill="none" stroke={t.cardBorder} strokeWidth="1" />

      <text x="26" y="44" fill={t.badgeText} fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontWeight="700" letterSpacing="2">
        {d.index}
      </text>
      <rect x="76" y="34" width="60" height="15" rx="3" fill={t.badgeBg} />
      <text x="106" y="45" fill={t.metaDim} fontSize="8.5" fontFamily="ui-monospace, monospace" fontWeight="600" textAnchor="middle" letterSpacing="1.5">
        EDITION
      </text>
      <text x="274" y="44" fill={t.metaDim} fontSize="9.5" fontFamily="ui-monospace, monospace" fontWeight="600" textAnchor="end" letterSpacing="2">
        {d.act}
      </text>

      <g dangerouslySetInnerHTML={{ __html: d.graphic(t, uid) }} />

      <text x="24" y="338" fill={t.dayText} fontSize="40" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="-1">
        {d.dayName}
      </text>

      <line x1="24" y1="365" x2="276" y2="365" stroke={t.rule} strokeWidth="1" />

      {isCustomTitle ? (
        <>
          <text x="24" y="392" fill={t.metaDim} fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="700" letterSpacing="2">
            LOGGED ENTRY
          </text>
          <text x="24" y="416" fill={t.dayText} fontSize="16" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" letterSpacing="0.2">
            {safeCustomTitle}
          </text>
          <text x="276" y="416" fill={t.metaDim} fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="600" textAnchor="end">
            {safeDate}
          </text>
        </>
      ) : (
        <>
          <text x="24" y="410" fill={t.metaDim} fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="700" letterSpacing="2">
            ORIGINAL POSTER
          </text>
          <text x="276" y="410" fill={t.metaDim} fontSize="13" fontFamily="ui-monospace, monospace" fontWeight="600" textAnchor="end">
            {safeDate}
          </text>
        </>
      )}

      <rect width="300" height="450" filter={`url(#react_grain_${uid})`} opacity={0.7} pointerEvents="none" />
    </svg>
  );
};
