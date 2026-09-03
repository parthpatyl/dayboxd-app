import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export const IS_MOBILE = Capacitor.isNativePlatform();
export const PLATFORM = Capacitor.getPlatform();

type BackHandler = () => boolean; // return true if handled, false to pass through
const backHandlers: BackHandler[] = [];

export function registerBackButtonHandler(handler: BackHandler) {
  backHandlers.push(handler);
  return () => {
    const idx = backHandlers.indexOf(handler);
    if (idx !== -1) backHandlers.splice(idx, 1);
  };
}

// Global Android Hardware back button listener
if (IS_MOBILE) {
  App.addListener('backButton', ({ canGoBack }) => {
    for (let i = backHandlers.length - 1; i >= 0; i--) {
      const handled = backHandlers[i]();
      if (handled) return;
    }
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}
