import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDuration = 700,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white select-none overflow-hidden"
        >
          {/* Subtle Background Geometric Cinema Grid Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="film-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                  <circle cx="24" cy="24" r="1" fill="#ffffff" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#film-grid)" />
            </svg>
          </div>

          {/* Central Minimalist Aperture & Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative flex flex-col items-center space-y-6"
          >
            {/* Geometric SVG Cinema Aperture Emblem */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-white"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Framing Circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeOpacity="0.2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />

                {/* Inner Reticle Marks */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  strokeOpacity="0.4"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Cinema Aperture Intersecting Blades */}
                <motion.path
                  d="M 50 16 L 76 38 L 68 70 L 32 70 L 24 38 Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{ duration: 0.55, delay: 0.05, ease: 'easeOut' }}
                />

                {/* 24fps Center Core */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="5"
                  fill="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.2, ease: 'backOut' }}
                />

                {/* Crosshair Registration Lines */}
                <line x1="50" y1="5" x2="50" y2="12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="50" y1="88" x2="50" y2="95" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="5" y1="50" x2="12" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="88" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              </svg>
            </div>

            {/* Clean Typographic Identity */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
              className="text-center space-y-1.5"
            >
              <div className="flex items-center justify-center">
                <span className="text-lg sm:text-xl font-black tracking-widest text-[#00e054] font-sans uppercase drop-shadow-[0_0_12px_rgba(0,224,84,0.5)]">
                  Dayboxd
                </span>
              </div>
              <p className="text-[9px] font-mono tracking-[0.3em] text-neutral-400 uppercase">
                Life As Cinema • Feature Film Every Day
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
