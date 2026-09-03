import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Calendar, Grid3X3, BarChart3, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Logbook', icon: BookOpen, exact: true },
  { path: '/diary', label: 'Diary', icon: Calendar },
  { path: '/films', label: 'Film Wall', icon: Grid3X3 },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

export const DesktopNav: React.FC = () => {
  return (
    <nav aria-label="Main Navigation" className="hidden sm:block w-full bg-theme-surface border-b border-theme-subtle px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 py-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-[background-color,color,transform] select-none active:scale-95 ${
                  isActive
                    ? 'bg-theme-elevated text-theme-primary border border-theme-strong shadow-xs font-bold ring-1 ring-white/10'
                    : 'text-theme-muted hover:text-theme-primary hover:bg-theme-elevated/40 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export const MobileTabBar: React.FC = () => {
  return (
    <nav aria-label="Mobile Navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-theme-surface border-t border-theme-subtle pb-[max(env(safe-area-inset-bottom,0px),16px)] pt-1 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] flex justify-center">
      <div className="w-full max-w-md mx-auto grid grid-cols-5 items-center px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-h-[48px] py-2 px-1 rounded-xl transition-transform duration-150 active:scale-95 relative ${
                  isActive
                    ? 'text-theme-primary font-bold'
                    : 'text-theme-muted hover:text-theme-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5 stroke-[2]" />
                  <span className="text-[11px] tracking-tight font-semibold leading-none">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-primary mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
