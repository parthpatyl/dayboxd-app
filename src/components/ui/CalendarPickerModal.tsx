import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  startOfDay,
  addMonths,
  subMonths,
  isValid,
  getDaysInMonth,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DayLog } from '../../types';

interface CalendarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateStr: string; // 'yyyy-MM-dd'
  onSelectDate: (dateStr: string) => void;
  days: DayLog[];
}

const FULL_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const START_YEAR = 2018;

export const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  isOpen,
  onClose,
  selectedDateStr,
  onSelectDate,
  days,
}) => {
  const initialDate = parseISO(selectedDateStr);
  const now = new Date();
  const currentYear = now.getFullYear();
  const todayStart = startOfDay(now);

  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(
    isValid(initialDate) ? initialDate : now
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(
    isValid(initialDate) ? initialDate : now
  );
  const [viewMode, setViewMode] = useState<'grid' | 'wheel'>('grid');

  // Wheel state
  const [wheelMonth, setWheelMonth] = useState<number>(
    (isValid(initialDate) ? initialDate : now).getMonth()
  );
  const [wheelDay, setWheelDay] = useState<number>(
    (isValid(initialDate) ? initialDate : now).getDate()
  );
  const [wheelYear, setWheelYear] = useState<number>(
    (isValid(initialDate) ? initialDate : now).getFullYear()
  );

  const monthScrollRef = useRef<HTMLDivElement>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const d = parseISO(selectedDateStr);
      const validD = isValid(d) ? d : now;
      setTempSelectedDate(validD);
      setCurrentMonth(validD);
      setWheelMonth(validD.getMonth());
      setWheelDay(validD.getDate());
      setWheelYear(validD.getFullYear());
      setViewMode('grid');
    }
  }, [isOpen, selectedDateStr]);

  // Center the wheel items on mode switch
  useEffect(() => {
    if (viewMode === 'wheel') {
      setTimeout(() => {
        centerWheelScroll(monthScrollRef.current, wheelMonth, 36);
        centerWheelScroll(dayScrollRef.current, wheelDay - 1, 36);
        centerWheelScroll(yearScrollRef.current, wheelYear - START_YEAR, 36);
      }, 50);
    }
  }, [viewMode]);

  const centerWheelScroll = (el: HTMLDivElement | null, index: number, itemHeight: number) => {
    if (el) {
      el.scrollTop = index * itemHeight;
    }
  };

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday

  // Map of logged days for fast lookup
  const loggedDaysMap = new Map<string, DayLog>();
  days.forEach((d) => loggedDaysMap.set(d.id, d));

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (!isAfter(startOfMonth(next), todayStart)) {
      setCurrentMonth(next);
    }
  };

  const isNextMonthBlocked = isAfter(startOfMonth(addMonths(currentMonth, 1)), todayStart);

  const handleConfirm = () => {
    if (viewMode === 'wheel') {
      // Validate date from wheel
      const daysInTargetMonth = getDaysInMonth(new Date(wheelYear, wheelMonth, 1));
      const clampedDay = Math.min(wheelDay, daysInTargetMonth);
      const targetDate = new Date(wheelYear, wheelMonth, clampedDay);

      // Check future blocker
      if (isAfter(startOfDay(targetDate), todayStart)) {
        onSelectDate(format(now, 'yyyy-MM-dd'));
      } else {
        onSelectDate(format(targetDate, 'yyyy-MM-dd'));
      }
    } else {
      onSelectDate(format(tempSelectedDate, 'yyyy-MM-dd'));
    }
    onClose();
  };

  const handleDaySelect = (day: Date) => {
    if (isAfter(startOfDay(day), todayStart)) return;
    setTempSelectedDate(day);
  };

  // Generate Year Range (2018 to currentYear)
  const yearsList = Array.from(
    { length: currentYear - START_YEAR + 1 },
    (_, i) => START_YEAR + i
  );

  const daysCountInWheelMonth = getDaysInMonth(new Date(wheelYear, wheelMonth, 1));
  const daysList = Array.from({ length: daysCountInWheelMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-[340px] bg-white dark:bg-[#1C1C1E] text-black dark:text-white border border-black/10 dark:border-white/10 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 p-5 space-y-4 select-none">
        {viewMode === 'grid' ? (
          /* =================== 1. APPLE CALENDAR GRID VIEW =================== */
          <div className="space-y-4">
            {/* Header: Month Year > on Left, < > on Right */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setWheelMonth(currentMonth.getMonth());
                  setWheelDay(tempSelectedDate.getDate());
                  setWheelYear(currentMonth.getFullYear());
                  setViewMode('wheel');
                }}
                className="flex items-center gap-1.5 text-base font-bold text-black dark:text-white hover:opacity-80 active:scale-95 transition-all group"
              >
                <span>{format(currentMonth, 'MMMM yyyy')}</span>
                <ChevronRight className="w-4 h-4 text-[#007AFF] stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-full text-[#007AFF] hover:bg-[#007AFF]/10 active:scale-90 transition-all"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={isNextMonthBlocked}
                  className="p-1 rounded-full text-[#007AFF] hover:bg-[#007AFF]/10 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title={isNextMonthBlocked ? 'Future month blocked' : 'Next Month'}
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Weekdays Header: SUN MON TUE WED THU FRI SAT */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Day Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {/* Empty leading slots */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9 w-9 mx-auto" />
              ))}

              {/* Month Days */}
              {daysInMonth.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isSelected = isSameDay(day, tempSelectedDate);
                const isFuture = isAfter(startOfDay(day), todayStart);
                const isToday = isSameDay(day, now);
                const log = loggedDaysMap.get(dateStr);

                return (
                  <div key={dateStr} className="flex items-center justify-center">
                    <button
                      type="button"
                      disabled={isFuture}
                      onClick={() => handleDaySelect(day)}
                      className={`relative w-9 h-9 rounded-full flex flex-col items-center justify-center text-xs transition-transform ${
                        isFuture
                          ? 'text-[#C7C7CC] dark:text-[#48484A] opacity-35 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#007AFF] text-white font-bold shadow-sm active:scale-95'
                          : isToday
                          ? 'text-[#007AFF] font-bold active:scale-95 hover:bg-black/5 dark:hover:bg-white/10'
                          : 'text-black dark:text-white font-normal hover:bg-black/5 dark:hover:bg-white/10 active:scale-95'
                      }`}
                    >
                      <span>{format(day, 'd')}</span>

                      {/* Logged Indicator Dot */}
                      {log && !isSelected && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#ffcc00]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions: CANCEL  OK */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#007AFF] hover:opacity-80 active:scale-95 transition-all"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#007AFF] hover:opacity-80 active:scale-95 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          /* =================== 2. APPLE CUPERTINO WHEEL PICKER VIEW =================== */
          <div className="space-y-4">
            {/* Header / Title */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:opacity-80 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Calendar</span>
              </button>
              <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
                Select Date
              </span>
            </div>

            {/* 3-Column Drum Roll Picker with Selection Overlay */}
            <div className="relative h-44 overflow-hidden rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 flex items-center justify-center">
              {/* Highlight selection band across center */}
              <div className="pointer-events-none absolute inset-x-2 h-9 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 z-0 shadow-xs" />

              {/* Gradient masks for 3D drum roll fade */}
              <div className="pointer-events-none absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-white dark:from-[#1C1C1E] via-white/80 dark:via-[#1C1C1E]/80 to-transparent z-10" />
              <div className="pointer-events-none absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-white dark:from-[#1C1C1E] via-white/80 dark:via-[#1C1C1E]/80 to-transparent z-10" />

              {/* Column 1: Month */}
              <div
                ref={monthScrollRef}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y', overscrollBehavior: 'contain' }}
                className="relative z-20 flex-1 h-full overflow-y-auto overflow-x-hidden scrollbar-none no-scrollbar py-16 snap-y snap-mandatory text-center"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const idx = Math.round(target.scrollTop / 36);
                  if (idx >= 0 && idx < 12) setWheelMonth(idx);
                }}
              >
                {FULL_MONTH_NAMES.map((mName, idx) => {
                  const isSelected = wheelMonth === idx;
                  const isFuture =
                    wheelYear > currentYear ||
                    (wheelYear === currentYear && idx > now.getMonth());

                  return (
                    <div
                      key={mName}
                      onClick={() => {
                        if (!isFuture) {
                          setWheelMonth(idx);
                          centerWheelScroll(monthScrollRef.current, idx, 36);
                        }
                      }}
                      className={`h-9 flex items-center justify-center px-1 snap-center text-xs transition-all cursor-pointer ${
                        isFuture
                          ? 'text-[#C7C7CC] dark:text-[#48484A] opacity-30 cursor-not-allowed'
                          : isSelected
                          ? 'text-black dark:text-white font-bold text-sm scale-105'
                          : 'text-[#8E8E93] font-normal'
                      }`}
                    >
                      {mName}
                    </div>
                  );
                })}
              </div>

              {/* Column 2: Day */}
              <div
                ref={dayScrollRef}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y', overscrollBehavior: 'contain' }}
                className="relative z-20 w-16 h-full overflow-y-auto overflow-x-hidden scrollbar-none no-scrollbar py-16 snap-y snap-mandatory text-center"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const idx = Math.round(target.scrollTop / 36);
                  if (idx >= 0 && idx < daysList.length) setWheelDay(idx + 1);
                }}
              >
                {daysList.map((dNum) => {
                  const isSelected = wheelDay === dNum;
                  const isFuture =
                    wheelYear > currentYear ||
                    (wheelYear === currentYear && wheelMonth > now.getMonth()) ||
                    (wheelYear === currentYear &&
                      wheelMonth === now.getMonth() &&
                      dNum > now.getDate());

                  return (
                    <div
                      key={dNum}
                      onClick={() => {
                        if (!isFuture) {
                          setWheelDay(dNum);
                          centerWheelScroll(dayScrollRef.current, dNum - 1, 36);
                        }
                      }}
                      className={`h-9 flex items-center justify-center snap-center text-xs transition-all cursor-pointer ${
                        isFuture
                          ? 'text-[#C7C7CC] dark:text-[#48484A] opacity-30 cursor-not-allowed'
                          : isSelected
                          ? 'text-black dark:text-white font-bold text-sm scale-105'
                          : 'text-[#8E8E93] font-normal'
                      }`}
                    >
                      {dNum}
                    </div>
                  );
                })}
              </div>

              {/* Column 3: Year */}
              <div
                ref={yearScrollRef}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y', overscrollBehavior: 'contain' }}
                className="relative z-20 w-20 h-full overflow-y-auto overflow-x-hidden scrollbar-none no-scrollbar py-16 snap-y snap-mandatory text-center"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const idx = Math.round(target.scrollTop / 36);
                  if (idx >= 0 && idx < yearsList.length) setWheelYear(yearsList[idx]);
                }}
              >
                {yearsList.map((yNum, idx) => {
                  const isSelected = wheelYear === yNum;
                  const isFuture = yNum > currentYear;

                  return (
                    <div
                      key={yNum}
                      onClick={() => {
                        if (!isFuture) {
                          setWheelYear(yNum);
                          centerWheelScroll(yearScrollRef.current, idx, 36);
                        }
                      }}
                      className={`h-9 flex items-center justify-center snap-center text-xs transition-all cursor-pointer ${
                        isFuture
                          ? 'text-[#C7C7CC] dark:text-[#48484A] opacity-30 cursor-not-allowed'
                          : isSelected
                          ? 'text-black dark:text-white font-bold text-sm scale-105'
                          : 'text-[#8E8E93] font-normal'
                      }`}
                    >
                      {yNum}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: CANCEL  OK */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#007AFF] hover:opacity-80 active:scale-95 transition-all"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#007AFF] hover:opacity-80 active:scale-95 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
