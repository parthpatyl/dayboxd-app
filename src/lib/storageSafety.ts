import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { readImageBase64, extractBase64Data, compressImageDataUri } from './imageStorage';

export interface ExportDataPayload {
  app: string;
  version: number;
  exportedAt: string;
  profile: any;
  days: any[];
  scenes: any[];
}

// Helper: Convert base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Convert Uint8Array to base64 string
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ─── Filesystem Mirror (silent background write) ─────────────────────────────

export async function mirrorStateToFilesystem(payload: Omit<ExportDataPayload, 'app'>): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const jsonStr = JSON.stringify(payload, null, 2);
    await Filesystem.writeFile({
      path: 'letterboxd_for_days_backup.json',
      data: jsonStr,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return true;
  } catch (err) {
    console.warn('Filesystem mirroring failed:', err);
    return false;
  }
}

// ─── Zip Backup Export (JSON + All Image Files) ───────────────────────────────

/**
 * Creates a complete .zip archive containing backup.json and an images/ folder
 * with all custom posters and profile avatars.
 */
export async function exportZipArchive(data: ExportDataPayload, filename: string): Promise<void> {
  const zipFiles: Record<string, Uint8Array> = {};

  // 1. Add backup.json
  const jsonStr = JSON.stringify(data, null, 2);
  zipFiles['backup.json'] = strToU8(jsonStr);

  // 2. Collect and package image files
  const imagePathsToInclude: string[] = [];
  if (data.profile?.avatarUrl) {
    imagePathsToInclude.push(data.profile.avatarUrl);
  }
  if (Array.isArray(data.days)) {
    data.days.forEach((day) => {
      if (day.posterImage) {
        imagePathsToInclude.push(day.posterImage);
      }
    });
  }

  for (const imgPath of imagePathsToInclude) {
    if (imgPath.startsWith('data:image/')) {
      // Legacy or web base64 data URI: compress to < 40KB
      const compressed = await compressImageDataUri(imgPath, 600, 900, 0.58);
      const { base64, extension } = extractBase64Data(compressed);
      const entryName = `images/img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${extension}`;
      try {
        zipFiles[entryName] = base64ToUint8Array(base64);
      } catch (err) {
        console.warn('Could not pack base64 image into zip:', err);
      }
    } else if (imgPath.startsWith('letterboxd_images/')) {
      // Native filesystem path: read and re-compress to < 40KB
      const rawBase64 = await readImageBase64(imgPath);
      if (rawBase64) {
        const compressed = await compressImageDataUri(rawBase64, 600, 900, 0.58);
        const { base64 } = extractBase64Data(compressed);
        const rawFilename = imgPath.split('/').pop() || 'image.jpg';
        try {
          zipFiles[`images/${rawFilename}`] = base64ToUint8Array(base64);
        } catch (err) {
          console.warn(`Could not pack ${imgPath} into zip:`, err);
        }
      }
    }
  }

  // 3. Compress into zip binary
  const zipped = zipSync(zipFiles, { level: 6 });
  const zipBase64 = uint8ArrayToBase64(zipped);

  // 4. Share or Download
  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.writeFile({
        path: filename,
        data: zipBase64,
        directory: Directory.Cache,
      });

      const { uri } = await Filesystem.getUri({
        path: filename,
        directory: Directory.Cache,
      });

      await Share.share({
        title: 'Dayboxd — Backup Archive',
        text: 'Complete archive backup with diary entries and photos.',
        url: uri,
        dialogTitle: 'Save Backup Archive (.zip)',
      });
    } catch (err) {
      console.error('Native Zip export failed:', err);
      throw err;
    }
  } else {
    // Web download
    const blob = new Blob([zipped as any], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ─── JSON Export (Lean / Text Only) ──────────────────────────────────────────

export async function downloadJsonFile(data: any, filename: string): Promise<void> {
  const jsonStr = JSON.stringify(data, null, 2);

  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.writeFile({
        path: filename,
        data: jsonStr,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      const { uri } = await Filesystem.getUri({
        path: filename,
        directory: Directory.Cache,
      });

      await Share.share({
        title: 'Dayboxd — JSON Backup',
        text: 'Your complete life archive backup file.',
        url: uri,
        dialogTitle: 'Save your backup',
      });
    } catch (err) {
      console.error('Native JSON export failed:', err);
      throw err;
    }
  } else {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ─── Markdown Export ─────────────────────────────────────────────────────────

export async function downloadMarkdownFile(markdownText: string, filename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.writeFile({
        path: filename,
        data: markdownText,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      const { uri } = await Filesystem.getUri({
        path: filename,
        directory: Directory.Cache,
      });

      await Share.share({
        title: 'Dayboxd — Markdown Archive',
        text: 'Your life diary exported as a Markdown document.',
        url: uri,
        dialogTitle: 'Save your archive',
      });
    } catch (err) {
      console.error('Native Markdown export failed:', err);
      throw err;
    }
  } else {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ─── Universal Restore (Handles both .zip and .json) ─────────────────────────

export async function parseBackupFile(file: File): Promise<ExportDataPayload | null> {
  const isZip = file.name.endsWith('.zip') || file.type.includes('zip');

  if (isZip) {
    try {
      const buffer = await file.arrayBuffer();
      const unzipped = unzipSync(new Uint8Array(buffer));

      let jsonPayload: ExportDataPayload | null = null;

      // 1. Locate and parse backup.json inside the zip
      for (const [relativePath, fileBytes] of Object.entries(unzipped)) {
        if (relativePath === 'backup.json' || relativePath.endsWith('/backup.json')) {
          const jsonText = strFromU8(fileBytes);
          jsonPayload = JSON.parse(jsonText);
          break;
        }
      }

      if (!jsonPayload) {
        throw new Error('backup.json not found inside zip archive');
      }

      // 2. Unpack image files to Documents directory on native
      if (Capacitor.isNativePlatform()) {
        for (const [relativePath, fileBytes] of Object.entries(unzipped)) {
          if (relativePath.startsWith('images/') && fileBytes.length > 0) {
            const rawFilename = relativePath.split('/').pop();
            if (rawFilename) {
              const base64Data = uint8ArrayToBase64(fileBytes);
              await Filesystem.writeFile({
                path: `letterboxd_images/${rawFilename}`,
                data: base64Data,
                directory: Directory.Documents,
                recursive: true,
              });
            }
          }
        }
      }

      return jsonPayload;
    } catch (err) {
      console.error('Failed to parse zip backup archive:', err);
      throw err;
    }
  } else {
    // Standard .json file
    const text = await file.text();
    return JSON.parse(text);
  }
}
