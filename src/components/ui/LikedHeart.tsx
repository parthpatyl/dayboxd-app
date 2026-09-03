import React from 'react';
import { Heart } from 'lucide-react';

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
    <button
      type="button"
      disabled={readOnly}
      aria-label={isLiked ? 'Unlike this day' : 'Like this day'}
      aria-pressed={isLiked}
      onClick={(e) => {
        e.stopPropagation();
        if (!readOnly && onToggle) onToggle();
      }}
      className={`inline-flex items-center justify-center p-2.5 rounded-full transition-transform duration-150 min-w-[44px] min-h-[44px] focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:outline-none ${
        readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95 cursor-pointer'
      } ${isLiked ? 'text-[#ff4d6d] drop-shadow-[0_0_8px_rgba(255,77,109,0.4)]' : 'text-theme-muted hover:text-theme-primary'}`}
      title={isLiked ? 'Liked day' : 'Like this day'}
    >
      <Heart
        className={`${sizeClasses[size]} transition-colors duration-150 ${
          isLiked ? 'fill-[#ff4d6d] stroke-[#ff4d6d]' : 'fill-none stroke-current stroke-[1.75]'
        }`}
      />
    </button>
  );
};
