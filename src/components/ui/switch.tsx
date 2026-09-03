import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

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
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-all duration-200 ease-in-out focus-visible:outline-none active:scale-95 shadow-xs items-center px-0.5',
        checked
          ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
          : 'bg-neutral-800 border-neutral-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out',
          checked
            ? 'translate-x-5 bg-white text-emerald-600'
            : 'translate-x-0.5 bg-neutral-400 text-transparent'
        )}
      >
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
      </span>
    </button>
  );
};
