import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LikedHeartProps {
  isLiked: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  color: string;
  delay: number;
  size: number;
}

export const LikedHeart: React.FC<LikedHeartProps> = ({
  isLiked,
  onToggle,
  size = 'md',
  readOnly = false,
}) => {
  const [burstCount, setBurstCount] = useState(0);
  const prevLikedRef = useRef(isLiked);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  useEffect(() => {
    // Only trigger floating burst when toggling from unliked to liked
    if (!prevLikedRef.current && isLiked) {
      setBurstCount((c) => c + 1);
    }
    prevLikedRef.current = isLiked;
  }, [isLiked]);

  const floatingHearts: FloatingParticle[] = [
    // Left arc mini-heart (radiant sunset coral-orange)
    { id: 1, x: -18, y: -34, scale: 0.85, rotate: -20, color: '#ff8000', delay: 0.04, size: 13 },
    // Center-top mini-heart (hot sunset pink)
    { id: 2, x: 1, y: -42, scale: 1.1, rotate: 10, color: '#ff4d6d', delay: 0, size: 15 },
    // Right arc mini-heart (rose-coral)
    { id: 3, x: 20, y: -30, scale: 0.8, rotate: 24, color: '#ff6b8b', delay: 0.08, size: 12 },
  ];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !onToggle) return;

    // Light tactile feedback on devices supporting Vibration API
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(!isLiked ? 12 : 8);
      } catch {
        // Ignore vibration errors if restricted by browser policy
      }
    }

    onToggle();
  };

  return (
    <motion.button
      type="button"
      disabled={readOnly}
      whileHover={readOnly ? undefined : { scale: 1.08 }}
      whileTap={readOnly ? undefined : { scale: 0.9 }}
      animate={
        isLiked
          ? {
              scale: [1, 0.72, 1.28, 0.95, 1.03, 1],
              rotate: [0, -6, 6, -3, 0],
            }
          : {
              scale: [1, 0.84, 1],
              rotate: 0,
            }
      }
      transition={{
        duration: isLiked ? 0.44 : 0.22,
        ease: 'easeOut',
      }}
      aria-label={isLiked ? 'Unlike this day' : 'Like this day'}
      aria-pressed={isLiked}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center p-2.5 rounded-full min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:outline-none select-none ${
        readOnly ? 'cursor-default' : 'cursor-pointer'
      } ${
        isLiked
          ? 'text-[#ff4d6d] drop-shadow-[0_0_12px_rgba(255,77,109,0.55)]'
          : 'text-theme-muted hover:text-theme-primary'
      }`}
      title={isLiked ? 'Liked day' : 'Like this day'}
    >
      {/* Sunset Gradient Defs for SVG fill */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="letterboxdHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff8000" />
            <stop offset="100%" stopColor="#ff4d6d" />
          </linearGradient>
        </defs>
      </svg>

      {/* Radial Aura Glow Pulse when liked */}
      <AnimatePresence>
        {isLiked && (
          <motion.div
            key={`glow_${burstCount}`}
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.7, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#ff8000]/40 to-[#ff4d6d]/40 blur-sm pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Floating Mini Hearts (Drifting upward and dissolving) */}
      <AnimatePresence>
        {burstCount > 0 &&
          floatingHearts.map((particle) => (
            <motion.div
              key={`float_${burstCount}_${particle.id}`}
              initial={{
                x: 0,
                y: 0,
                scale: 0.2,
                opacity: 0.95,
                rotate: 0,
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0.2, particle.scale, 0],
                opacity: [0.95, 0.9, 0],
                rotate: particle.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.72,
                delay: particle.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute pointer-events-none z-20 flex items-center justify-center"
              style={{ color: particle.color }}
            >
              <Heart
                style={{ width: particle.size, height: particle.size }}
                className="fill-current stroke-current drop-shadow-[0_0_6px_rgba(255,77,109,0.7)]"
              />
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Main Heart */}
      <Heart
        className={`${sizeClasses[size]} transition-colors duration-200 ${
          isLiked
            ? 'stroke-[#ff4d6d]'
            : 'fill-none stroke-current stroke-[1.75]'
        }`}
        style={isLiked ? { fill: 'url(#letterboxdHeartGrad)' } : undefined}
      />
    </motion.button>
  );
};
