import { removeBackground as removeBackgroundAI } from '@imgly/background-removal';
import type { ConversionOptions } from '../types/index';

export interface ConversionResult {
  convertedBlob: Blob;
  convertedUrl: string;
  originalSize: number;
  convertedSize: number;
  compressionRatio: number;
}

export async function convertImage(
  file: File,
  targetFormat: 'webp' | 'jpeg' | 'png' = 'webp',
  options: ConversionOptions = { quality: 0.8 }
): Promise<ConversionResult> {
  const { quality = 0.8, maxWidth } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (maxWidth && targetWidth > maxWidth) {
        targetHeight = Math.round((img.height * maxWidth) / targetWidth);
        targetWidth = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Gagal mendapatkan konteks Canvas 2D.'));
        return;
      }

      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = `image/${targetFormat}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(`Gagal melakukan konversi gambar ke ${targetFormat.toUpperCase()}.`));
            return;
          }

          const convertedUrl = URL.createObjectURL(blob);
          const originalSize = file.size;
          const convertedSize = blob.size;
          const compressionRatio = Number(
            (((originalSize - convertedSize) / originalSize) * 100).toFixed(1)
          );

          resolve({
            convertedBlob: blob,
            convertedUrl,
            originalSize,
            convertedSize,
            compressionRatio,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('File tidak dapat dibaca sebagai gambar.'));
    };

    img.src = objectUrl;
  });
}

export async function removeBackground(file: File): Promise<ConversionResult> {
  try {
    const blob = await removeBackgroundAI(file);
    const convertedUrl = URL.createObjectURL(blob);
    const originalSize = file.size;
    const convertedSize = blob.size;
    const compressionRatio = Number(
      (((originalSize - convertedSize) / originalSize) * 100).toFixed(1)
    );

    return {
      convertedBlob: blob,
      convertedUrl,
      originalSize,
      convertedSize,
      compressionRatio,
    };
  } catch (error) {
    throw new Error('Gagal menghapus background gambar.');
  }
}