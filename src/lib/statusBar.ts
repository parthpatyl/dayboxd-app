import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export async function syncStatusBarTheme(theme: 'dark' | 'light') {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    if (theme === 'light') {
      // Light Mode: Dark text/icons on white background
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    } else {
      // Dark Mode: White text/icons on black background
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    }
  } catch (err) {
    console.warn('StatusBar sync error:', err);
  }
}
