import React from 'react';
import { useUI } from '../../store/useUI';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  const currentToast = toasts[0];
  if (!currentToast) return null;

  return (
    <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 pt-safe animate-in fade-in slide-in-from-top-3 duration-200">
      <div
        key={currentToast.id}
        className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full border border-theme-strong bg-theme-surface/95 backdrop-blur-xl shadow-2xl text-theme-primary text-xs font-medium max-w-sm w-auto"
      >
        {currentToast.type === 'success' && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        )}
        {currentToast.type === 'error' && (
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        )}
        {currentToast.type === 'info' && (
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        )}

        <span className="truncate">{currentToast.message}</span>

        <button
          onClick={() => removeToast(currentToast.id)}
          className="text-theme-muted hover:text-theme-primary p-0.5 rounded-full transition-colors ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
