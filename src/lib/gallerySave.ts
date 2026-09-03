/**
 * TypeScript bridge for the native GallerySavePlugin.
 * Saves an image file (by its native file:// URI) directly to the device Gallery
 * using MediaStore API on Android 10+ — no share sheet required.
 */
import { registerPlugin } from '@capacitor/core';

interface GallerySavePlugin {
  saveToGallery(options: {
    filePath: string;
    fileName: string;
  }): Promise<{ uri: string; fileName: string }>;
}

const GallerySave = registerPlugin<GallerySavePlugin>('GallerySave', {
  web: {
    // Web fallback: no-op, returns a dummy result
    saveToGallery: async ({ fileName }: { filePath: string; fileName: string }) => ({
      uri: '',
      fileName,
    }),
  },
});

export { GallerySave };
export type { GallerySavePlugin };
