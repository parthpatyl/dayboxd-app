import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { db } from '../db';

const IMAGES_DIR = 'letterboxd_images';
const resolvedUrlCache = new Map<string, string>();

/**
 * Helper to split data URI into raw base64 string and file extension
 */
export function extractBase64Data(dataUri: string): { base64: string; extension: string } {
  if (dataUri.startsWith('data:')) {
    const commaIndex = dataUri.indexOf(',');
    const header = dataUri.substring(0, commaIndex);
    const base64 = dataUri.substring(commaIndex + 1);
    let extension = 'jpg';
    if (header.includes('image/png')) extension = 'png';
    else if (header.includes('image/webp')) extension = 'webp';
    else if (header.includes('image/gif')) extension = 'gif';
    return { base64, extension };
  }
  return { base64: dataUri, extension: 'jpg' };
}

/**
 * Check if a stored string is a legacy base64 data URI
 */
export function isBase64Image(value?: string | null): boolean {
  if (!value) return false;
  return value.startsWith('data:image/');
}

/**
 * Highly optimized, lightweight image compressor.
 * - Posters: Max 600px width x 900px height (2:3 standard poster ratio)
 * - Avatars: Max 300px x 300px
 * - Quality: 58% high-efficiency JPEG (~20-40KB total size)
 * - Preserves animated GIFs intact
 */
export async function compressImageDataUri(
  dataUri: string,
  maxWidth = 600,
  maxHeight = 900,
  quality = 0.58
): Promise<string> {
  // Preserve animated GIFs
  if (dataUri.startsWith('data:image/gif')) {
    return dataUri;
  }

  // Ensure full data URI prefix if raw base64 passed
  const formattedDataUri = dataUri.startsWith('data:')
    ? dataUri
    : `data:image/jpeg;base64,${dataUri}`;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Calculate proportional aspect ratio downscaling
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(formattedDataUri);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Encode as compact JPEG
      const compressedDataUri = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUri);
    };

    img.onerror = () => {
      resolve(formattedDataUri);
    };

    img.src = formattedDataUri;
  });
}

/**
 * Save an image (base64 data URI or raw base64) to the native filesystem
 * Returns relative path e.g. "letterboxd_images/poster_2026-09-01.jpg" on native,
 * or compressed data URI on web.
 */
export async function saveImageToFilesystem(
  dataUri: string,
  type: 'poster' | 'avatar',
  identifier: string
): Promise<{ storagePath: string; displayUrl: string }> {
  // Lightweight compression before saving
  const compressedUri = await compressImageDataUri(
    dataUri,
    type === 'poster' ? 600 : 300,
    type === 'poster' ? 900 : 300,
    0.58
  );

  if (!Capacitor.isNativePlatform()) {
    // Web fallback: keep as lightweight data URI
    return { storagePath: compressedUri, displayUrl: compressedUri };
  }

  try {
    const { base64, extension } = extractBase64Data(compressedUri);
    const safeId = identifier.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${type}_${safeId}_${Date.now()}.${extension}`;
    const relativePath = `${IMAGES_DIR}/${filename}`;

    // Ensure directory exists & write binary file
    await Filesystem.writeFile({
      path: relativePath,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });

    // Get native URI and convert for WebView <img> rendering
    const { uri } = await Filesystem.getUri({
      path: relativePath,
      directory: Directory.Documents,
    });

    const displayUrl = Capacitor.convertFileSrc(uri);
    resolvedUrlCache.set(relativePath, displayUrl);

    return { storagePath: relativePath, displayUrl };
  } catch (err) {
    console.error('Failed to save image to filesystem, falling back to data URI:', err);
    return { storagePath: compressedUri, displayUrl: compressedUri };
  }
}

/**
 * Resolves a storage path (e.g. "letterboxd_images/poster.jpg") to a webview-renderable URL.
 */
export async function resolveImageDisplayUrl(storagePath?: string | null): Promise<string | null> {
  if (!storagePath) return null;

  // Already a full web/data URL
  if (
    storagePath.startsWith('data:') ||
    storagePath.startsWith('http://') ||
    storagePath.startsWith('https://') ||
    storagePath.startsWith('blob:')
  ) {
    return storagePath;
  }

  // Check in-memory cache
  if (resolvedUrlCache.has(storagePath)) {
    return resolvedUrlCache.get(storagePath)!;
  }

  if (!Capacitor.isNativePlatform()) {
    return storagePath;
  }

  try {
    const { uri } = await Filesystem.getUri({
      path: storagePath,
      directory: Directory.Documents,
    });
    const webViewUrl = Capacitor.convertFileSrc(uri);
    resolvedUrlCache.set(storagePath, webViewUrl);
    return webViewUrl;
  } catch (err) {
    console.warn(`Could not resolve image URI for ${storagePath}:`, err);
    return storagePath;
  }
}

/**
 * Synchronous resolver for render cycles (falls back to cache or raw path)
 */
export function getCachedDisplayUrl(storagePath?: string | null): string | null {
  if (!storagePath) return null;
  if (
    storagePath.startsWith('data:') ||
    storagePath.startsWith('http://') ||
    storagePath.startsWith('https://') ||
    storagePath.startsWith('blob:')
  ) {
    return storagePath;
  }
  return resolvedUrlCache.get(storagePath) || storagePath;
}

/**
 * Delete image file from filesystem if it is a local file
 */
export async function deleteImageFromFilesystem(storagePath?: string | null): Promise<void> {
  if (!storagePath || !Capacitor.isNativePlatform()) return;
  if (!storagePath.startsWith(IMAGES_DIR)) return;

  try {
    await Filesystem.deleteFile({
      path: storagePath,
      directory: Directory.Documents,
    });
    resolvedUrlCache.delete(storagePath);
  } catch (err) {
    console.warn(`Could not delete image file at ${storagePath}:`, err);
  }
}

/**
 * Read image file data as Base64 string from filesystem
 */
export async function readImageBase64(storagePath: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const result = await Filesystem.readFile({
      path: storagePath,
      directory: Directory.Documents,
    });
    return result.data as string;
  } catch (err) {
    console.error(`Could not read image file ${storagePath}:`, err);
    return null;
  }
}

/**
 * Pre-cache all image URLs for fast synchronous rendering
 */
export async function preCacheAllImages(paths: (string | undefined | null)[]): Promise<void> {
  const validPaths = paths.filter((p): p is string => !!p && !p.startsWith('data:') && !p.startsWith('http'));
  await Promise.all(validPaths.map((p) => resolveImageDisplayUrl(p)));
}

/**
 * Silent Migration & In-Place Compression:
 * 1. Converts legacy in-DB Base64 strings to filesystem files.
 * 2. Scans any existing oversized files on disk (>60KB) and re-compresses them down to ~25-40KB.
 */
export async function migrateLegacyBase64Images(): Promise<number> {
  let optimizedCount = 0;

  try {
    // 1. Check Profile Avatar
    const profile = await db.profile.get('default_user');
    if (profile?.avatarUrl) {
      if (isBase64Image(profile.avatarUrl)) {
        const { storagePath, displayUrl } = await saveImageToFilesystem(
          profile.avatarUrl,
          'avatar',
          'profile'
        );
        await db.profile.update('default_user', { avatarUrl: storagePath });
        resolvedUrlCache.set(storagePath, displayUrl);
        optimizedCount++;
      } else if (Capacitor.isNativePlatform() && profile.avatarUrl.startsWith(IMAGES_DIR)) {
        // Re-compress if existing file on disk is large
        const rawBase64 = await readImageBase64(profile.avatarUrl);
        if (rawBase64 && rawBase64.length > 50000) {
          const compressed = await compressImageDataUri(rawBase64, 300, 300, 0.58);
          const { base64 } = extractBase64Data(compressed);
          await Filesystem.writeFile({
            path: profile.avatarUrl,
            data: base64,
            directory: Directory.Documents,
          });
          optimizedCount++;
        }
      }
    }

    // 2. Check All Custom Day Posters
    const allDays = await db.days.toArray();
    for (const day of allDays) {
      if (day.posterType === 'custom' && day.posterImage) {
        if (isBase64Image(day.posterImage)) {
          const { storagePath, displayUrl } = await saveImageToFilesystem(
            day.posterImage,
            'poster',
            day.id
          );
          await db.days.update(day.id, { posterImage: storagePath });
          resolvedUrlCache.set(storagePath, displayUrl);
          optimizedCount++;
        } else if (Capacitor.isNativePlatform() && day.posterImage.startsWith(IMAGES_DIR)) {
          // Re-compress existing file on disk if it exceeds ~60KB
          const rawBase64 = await readImageBase64(day.posterImage);
          if (rawBase64 && rawBase64.length > 60000) {
            const compressed = await compressImageDataUri(rawBase64, 600, 900, 0.58);
            const { base64 } = extractBase64Data(compressed);
            await Filesystem.writeFile({
              path: day.posterImage,
              data: base64,
              directory: Directory.Documents,
            });
            optimizedCount++;
          }
        }
      }
    }

    if (optimizedCount > 0) {
      console.log(`[ImageOptimization] Compressed and optimized ${optimizedCount} images!`);
    }
  } catch (err) {
    console.error('[ImageOptimization] Error during image optimization:', err);
  }

  return optimizedCount;
}

/**
 * Purges all images in the Documents/letterboxd_images/ directory for a complete clean slate.
 */
export async function purgeAllStorageImages(): Promise<void> {
  resolvedUrlCache.clear();
  if (!Capacitor.isNativePlatform()) return;

  try {
    const list = await Filesystem.readdir({
      path: IMAGES_DIR,
      directory: Directory.Documents,
    });
    for (const file of list.files) {
      await Filesystem.deleteFile({
        path: `${IMAGES_DIR}/${file.name}`,
        directory: Directory.Documents,
      });
    }
  } catch (err) {
    // Directory might not exist yet, ignore
  }
}
