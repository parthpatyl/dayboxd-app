import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer hover:brightness-105 active:scale-[0.96]',
  {
    variants: {
      variant: {
        default: 'bg-[#00e054] text-black font-semibold hover:bg-[#00c030] shadow-sm hover:shadow-[0_0_15px_rgba(0,224,84,0.35)]',
        secondary: 'bg-[#2c3440] text-neutral-100 hover:bg-[#363f4d] border border-white/10',
        outline: 'border border-white/15 bg-transparent hover:bg-white/5 text-neutral-200',
        ghost: 'hover:bg-white/10 text-neutral-300 hover:text-white',
        danger: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30',
        cinema: 'bg-gradient-to-r from-[#00e054] to-[#40bcf4] text-black font-bold shadow-lg hover:brightness-110',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
