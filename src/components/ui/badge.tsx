import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'brand' | 'secondary' | 'heart';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#2c3440] text-neutral-200 border-white/10',
    outline: 'border border-white/20 text-neutral-300 bg-transparent',
    brand: 'bg-[#00e054]/15 text-[#00e054] border-[#00e054]/30',
    secondary: 'bg-white/5 text-neutral-400 border-white/5',
    heart: 'bg-[#ff4d6d]/15 text-[#ff4d6d] border-[#ff4d6d]/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-micro',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
