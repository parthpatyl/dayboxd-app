import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  className,
  disabled = false,
}) => {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus-visible:outline-none shadow-xs items-center px-0.5',
        checked
          ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
          : 'bg-neutral-800 border-neutral-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        className={cn(
          'pointer-events-none flex items-center justify-center h-5 w-5 rounded-full shadow-md',
          checked
            ? 'bg-white text-emerald-600'
            : 'bg-neutral-400 text-transparent'
        )}
      >
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
      </motion.span>
    </motion.button>
  );
};
