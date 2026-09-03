import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LikedHeartProps {
  isLiked: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export const LikedHeart: React.FC<LikedHeartProps> = ({
  isLiked,
  onToggle,
  size = 'md',
  readOnly = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.button
      type="button"
      disabled={readOnly}
      whileHover={readOnly ? undefined : { scale: 1.06 }}
      whileTap={readOnly ? undefined : { scale: 0.92 }}
      animate={isLiked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      aria-label={isLiked ? 'Unlike this day' : 'Like this day'}
      aria-pressed={isLiked}
      onClick={(e) => {
        e.stopPropagation();
        if (!readOnly && onToggle) onToggle();
      }}
      className={`inline-flex items-center justify-center p-2.5 rounded-full min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:outline-none ${
        readOnly ? 'cursor-default' : 'cursor-pointer'
      } ${isLiked ? 'text-[#ff4d6d] drop-shadow-[0_0_10px_rgba(255,77,109,0.5)]' : 'text-theme-muted hover:text-theme-primary'}`}
      title={isLiked ? 'Liked day' : 'Like this day'}
    >
      <Heart
        className={`${sizeClasses[size]} transition-all duration-150 ${
          isLiked ? 'fill-[#ff4d6d] stroke-[#ff4d6d]' : 'fill-none stroke-current stroke-[1.75]'
        }`}
      />
    </motion.button>
  );
};
