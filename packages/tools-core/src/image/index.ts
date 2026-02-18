export type ImageOutputFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif';

export type ResizeOptions = {
  maxWidth: number;
  maxHeight: number;
};

export type OptimizeOptions = ResizeOptions & {
  format: ImageOutputFormat;
  quality: number;
};

export type OptimizeImageResult = {
  blob: globalThis.Blob;
  width: number;
  height: number;
  originalBytes: number;
  optimizedBytes: number;
};

export const computeContainDimensions = (
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } => {
  const widthRatio = maxWidth / sourceWidth;
  const heightRatio = maxHeight / sourceHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  return {
    width: Math.max(1, Math.round(sourceWidth * ratio)),
    height: Math.max(1, Math.round(sourceHeight * ratio)),
  };
};

const createCanvas = (width: number, height: number): globalThis.HTMLCanvasElement => {
  const canvas = globalThis.document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const canvasToBlob = (canvas: globalThis.HTMLCanvasElement, format: ImageOutputFormat, quality: number): Promise<globalThis.Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode image.'));
          return;
        }

        resolve(blob);
      },
      format,
      quality,
    );
  });

export const isFormatSupported = (format: ImageOutputFormat): boolean => {
  if (typeof globalThis.document === 'undefined') {
    return false;
  }

  const canvas = createCanvas(1, 1);

  try {
    const url = canvas.toDataURL(format);
    return url.startsWith(`data:${format}`);
  } catch {
    return false;
  }
};

export const decodeImageFile = async (file: globalThis.File): Promise<globalThis.ImageBitmap> => {
  return globalThis.createImageBitmap(file);
};

export const optimizeImageFile = async (file: globalThis.File, options: OptimizeOptions): Promise<OptimizeImageResult> => {
  const bitmap = await decodeImageFile(file);

  const target = computeContainDimensions(bitmap.width, bitmap.height, options.maxWidth, options.maxHeight);
  const canvas = createCanvas(target.width, target.height);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('2D canvas context unavailable.');
  }

  context.drawImage(bitmap, 0, 0, target.width, target.height);
  bitmap.close();

  const blob = await canvasToBlob(canvas, options.format, options.quality);

  return {
    blob,
    width: target.width,
    height: target.height,
    originalBytes: file.size,
    optimizedBytes: blob.size,
  };
};
