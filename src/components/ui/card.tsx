import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-white/10 bg-[#1f242d] text-neutral-100 shadow-md transition-all',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';
