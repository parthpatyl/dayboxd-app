import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface UIState {
  ticketModalDayId: string | null;
  lightboxImageUrl: string | null;
  toasts: ToastItem[];

  openTicketModal: (dayId: string) => void;
  closeTicketModal: () => void;
  openLightbox: (url: string) => void;
  closeLightbox: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useUI = create<UIState>((set) => ({
  ticketModalDayId: null,
  lightboxImageUrl: null,
  toasts: [],

  openTicketModal: (dayId: string) => set({ ticketModalDayId: dayId }),
  closeTicketModal: () => set({ ticketModalDayId: null }),

  openLightbox: (url: string) => set({ lightboxImageUrl: url }),
  closeLightbox: () => set({ lightboxImageUrl: null }),

  showToast: (message: string, type = 'success') => {
    const id = 'toast_' + Date.now();
    // Strictly cap at 1 active toast to prevent stacking
    set({ toasts: [{ id, message, type }] });

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 2200);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
