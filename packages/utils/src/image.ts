export interface UserUploadInfo {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface CompressionOptions {
  maxSide: number;
  maxFileSize: number;
  quality: number;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  aspectRatioRange: [number, number];
  maxRecursion: number;
}

export interface GenerateUrlOptions {
  limitSide?: number;
  limitFile?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  aspectRatio?: number;
  aspectRatioRange?: [number, number];
  recursionCount?: number;
}

export const defaultCompressSettings: CompressionOptions = {
  maxSide: 4096,
  maxFileSize: 1024 * 1024 * 10,
  quality: 1,
  format: 'image/jpeg',
  aspectRatioRange: [0.4, 2.5],
  maxRecursion: 10,
};

export const PRE_COMPRESS_CONFIG = {
  MIN_SIZE: 300 * 1024,
  COMPRESS_RATIO: 6,
  SIZE_THRESHOLD: 1024 * 1024,
} as const;

/**
 * 智能预压缩：
 *   - 原图 > 1MB：压到 1/6（不低于 300KB）
 *   - 原图 ≤ 1MB 且 > 300KB：压到 300KB
 *   - 原图 ≤ 300KB：仅尺寸限制
 */
export function preCompressImage(fileRaw: Blob): Promise<UserUploadInfo> {
  const originalSize = fileRaw.size;

  if (originalSize <= PRE_COMPRESS_CONFIG.MIN_SIZE) {
    return compressImage(fileRaw, {
      limitSide: defaultCompressSettings.maxSide,
      limitFile: defaultCompressSettings.maxFileSize,
    });
  }

  let targetSize: number;
  if (originalSize > PRE_COMPRESS_CONFIG.SIZE_THRESHOLD) {
    targetSize = Math.max(
      PRE_COMPRESS_CONFIG.MIN_SIZE,
      Math.round(originalSize / PRE_COMPRESS_CONFIG.COMPRESS_RATIO),
    );
  } else {
    targetSize = PRE_COMPRESS_CONFIG.MIN_SIZE;
  }

  return compressImage(fileRaw, {
    limitSide: defaultCompressSettings.maxSide,
    limitFile: targetSize,
  });
}

/**
 * 通过 Canvas 压缩图片
 *   - 限制最大边长
 *   - 限制最大文件体积（递归二次压缩）
 *   - 宽高比超出范围时居中裁剪
 *   - limitSide = -1 时跳过压缩，仅返回元信息
 */
export function compressImage(
  fileRaw: Blob,
  options: GenerateUrlOptions = {},
): Promise<UserUploadInfo> {
  const {
    limitSide = defaultCompressSettings.maxSide,
    limitFile: maxFileSize = defaultCompressSettings.maxFileSize,
    format = defaultCompressSettings.format,
    aspectRatioRange = defaultCompressSettings.aspectRatioRange,
    aspectRatio = 0,
    recursionCount = 0,
  } = options;
  const extension = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpeg';

  return new Promise((resolve) => {
    if (recursionCount >= defaultCompressSettings.maxRecursion) {
      resolve({ blob: fileRaw, url: '', size: fileRaw.size, width: 0, height: 0, aspectRatio });
      return;
    }

    const fileReader = new FileReader();
    fileReader.onabort = () => {
      resolve({ blob: fileRaw, url: '', size: fileRaw.size, width: 0, height: 0, aspectRatio });
    };
    fileReader.onerror = () => {
      resolve({ blob: fileRaw, url: '', size: fileRaw.size, width: 0, height: 0, aspectRatio });
    };
    fileReader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string') {
        resolve({ blob: fileRaw, url: '', size: fileRaw.size, width: 0, height: 0, aspectRatio });
        return;
      }

      const fileUrl = result;
      const eleImg = new Image();
      eleImg.setAttribute('crossOrigin', 'Anonymous');
      eleImg.src = fileUrl;

      eleImg.onload = () => {
        try {
          const iWidth = eleImg.naturalWidth || eleImg.width;
          const iHeight = eleImg.naturalHeight || eleImg.height;

          if (limitSide === -1) {
            resolve({
              blob: fileRaw,
              url: fileUrl,
              size: fileRaw.size,
              width: iWidth,
              height: iHeight,
              aspectRatio: iHeight > 0 ? iWidth / iHeight : aspectRatio,
            });
            return;
          }

          const currentAspectRatio = iWidth / iHeight;
          const [minRatio, maxRatio] = aspectRatioRange;

          let cropX = 0;
          let cropY = 0;
          let cropWidth = iWidth;
          let cropHeight = iHeight;

          if (currentAspectRatio < minRatio || currentAspectRatio > maxRatio) {
            if (currentAspectRatio < minRatio) {
              const targetHeight = iWidth / minRatio;
              cropHeight = Math.round(targetHeight);
              cropY = Math.round((iHeight - cropHeight) / 2);
            } else {
              const targetWidth = iHeight * maxRatio;
              cropWidth = Math.round(targetWidth);
              cropX = Math.round((iWidth - cropWidth) / 2);
            }
          }

          const maxSide = Math.max(cropWidth, cropHeight);
          const needCompress = maxSide > limitSide;
          let scaleWidth = cropWidth;
          let scaleHeight = cropHeight;

          if (needCompress) {
            const scaleRatio = limitSide / maxSide;
            scaleWidth = Math.round(cropWidth * scaleRatio);
            scaleHeight = Math.round(cropHeight * scaleRatio);
          }
          const calcAspectRatio = scaleHeight > 0 ? scaleWidth / scaleHeight : aspectRatio;

          const canvas = document.createElement('canvas');
          canvas.width = scaleWidth;
          canvas.height = scaleHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              blob: fileRaw,
              url: fileUrl,
              size: fileRaw.size,
              width: scaleWidth,
              height: scaleHeight,
              aspectRatio: calcAspectRatio,
            });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          if ('imageSmoothingQuality' in ctx) {
            ctx.imageSmoothingQuality = 'high';
          }

          ctx.drawImage(eleImg, cropX, cropY, cropWidth, cropHeight, 0, 0, scaleWidth, scaleHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve({
                  blob: fileRaw,
                  url: fileUrl,
                  size: fileRaw.size,
                  width: scaleWidth,
                  height: scaleHeight,
                  aspectRatio: calcAspectRatio,
                });
                return;
              }
              const compressedFile = new File([blob], `compressed_${Date.now()}.${extension}`, {
                type: format,
              });

              if (compressedFile.size > maxFileSize) {
                const sizeRatio = Math.sqrt(maxFileSize / compressedFile.size);
                const newLimitSide = Math.max(100, Math.round(limitSide * sizeRatio));

                compressImage(compressedFile, {
                  limitSide: newLimitSide,
                  limitFile: maxFileSize,
                  format,
                  aspectRatio: calcAspectRatio,
                  aspectRatioRange,
                  recursionCount: recursionCount + 1,
                })
                  .then(resolve)
                  .catch(() => {
                    resolve({
                      blob: compressedFile,
                      url: URL.createObjectURL(compressedFile),
                      size: compressedFile.size,
                      width: scaleWidth,
                      height: scaleHeight,
                      aspectRatio: calcAspectRatio,
                    });
                  });
              } else {
                resolve({
                  blob: compressedFile,
                  url: URL.createObjectURL(compressedFile),
                  size: compressedFile.size,
                  width: scaleWidth,
                  height: scaleHeight,
                  aspectRatio: calcAspectRatio,
                });
              }
            },
            format,
            defaultCompressSettings.quality,
          );
        } catch {
          const width = eleImg.naturalWidth || eleImg.width;
          const height = eleImg.naturalHeight || eleImg.height;
          resolve({
            blob: fileRaw,
            url: fileUrl,
            size: fileRaw.size,
            width,
            height,
            aspectRatio: height > 0 ? width / height : aspectRatio,
          });
        }
      };

      eleImg.onerror = () => {
        resolve({ blob: fileRaw, url: '', size: fileRaw.size, width: 0, height: 0, aspectRatio });
      };
    };
    fileReader.readAsDataURL(fileRaw);
  });
}
