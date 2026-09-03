import React from 'react';
import { cn } from '../../lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-xl border border-theme-subtle bg-theme-input px-3 py-2 text-sm text-theme-primary placeholder:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:border-transparent transition-micro disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';
