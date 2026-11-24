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
  quality?: number;
  aspectRatio?: number;
  /** 超出范围时居中裁剪；上传预处理请用 NO_ASPECT_CROP_RANGE 关闭 */
  aspectRatioRange?: [number, number];
  recursionCount?: number;
}

/** 对齐 aigc-camera-web `generateUrlByFileRaw` 默认 */
export const UPLOAD_PREPARE_DEFAULTS = {
  maxSide: 1024,
  maxBytes: 1024 * 1024,
  quality: 0.7,
  format: 'image/jpeg' as const,
  minMaxSide: 100,
} as const;

/** 关闭宽高比裁剪（相机站上传链路无裁剪） */
export const NO_ASPECT_CROP_RANGE: [number, number] = [0, Number.POSITIVE_INFINITY];

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
      aspectRatioRange: NO_ASPECT_CROP_RANGE,
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
    aspectRatioRange: NO_ASPECT_CROP_RANGE,
  });
}

export interface PrepareImageForUploadOptions {
  /** 最长边，默认 1024；-1 跳过缩放重编码 */
  maxSide?: number;
  /** 目标体积（字节），默认 1MB */
  maxBytes?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** 0–1，默认 0.7 */
  quality?: number;
}

/**
 * 上传前标准预处理（对齐 aigc-camera-web）：
 * Canvas 最长边缩放 + JPEG 0.7 + 递归压到约 1MB；不做宽高比裁剪。
 */
export function prepareImageForUpload(
  fileRaw: Blob,
  options: PrepareImageForUploadOptions = {},
): Promise<UserUploadInfo> {
  const {
    maxSide = UPLOAD_PREPARE_DEFAULTS.maxSide,
    maxBytes = UPLOAD_PREPARE_DEFAULTS.maxBytes,
    format = UPLOAD_PREPARE_DEFAULTS.format,
    quality = UPLOAD_PREPARE_DEFAULTS.quality,
  } = options;

  return compressImage(fileRaw, {
    limitSide: maxSide,
    limitFile: maxBytes,
    format,
    quality,
    aspectRatioRange: NO_ASPECT_CROP_RANGE,
  });
}

/**
 * @deprecated 兼容相机站命名；请改用 prepareImageForUpload
 */
export function generateUrlByFileRaw(
  fileRaw: Blob,
  limitSide = UPLOAD_PREPARE_DEFAULTS.maxSide,
  limitFile = UPLOAD_PREPARE_DEFAULTS.maxBytes,
): Promise<UserUploadInfo> {
  return prepareImageForUpload(fileRaw, { maxSide: limitSide, maxBytes: limitFile });
}

/**
 * 通过 Canvas 压缩图片
 *   - 限制最大边长
 *   - 限制最大文件体积（递归二次压缩）
 *   - 宽高比超出范围时居中裁剪（可用 NO_ASPECT_CROP_RANGE 关闭）
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
    quality = defaultCompressSettings.quality,
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
          const cropEnabled =
            Number.isFinite(minRatio) &&
            Number.isFinite(maxRatio) &&
            minRatio > 0 &&
            maxRatio < Number.POSITIVE_INFINITY;

          let cropX = 0;
          let cropY = 0;
          let cropWidth = iWidth;
          let cropHeight = iHeight;

          if (cropEnabled && (currentAspectRatio < minRatio || currentAspectRatio > maxRatio)) {
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
                // 与相机站同形：按体积比缩小最长边；过小则停止继续压
                const newLimitSide = Math.round((limitSide * maxFileSize) / compressedFile.size);
                if (newLimitSide <= UPLOAD_PREPARE_DEFAULTS.minMaxSide) {
                  resolve({
                    blob: compressedFile,
                    url: URL.createObjectURL(compressedFile),
                    size: compressedFile.size,
                    width: scaleWidth,
                    height: scaleHeight,
                    aspectRatio: calcAspectRatio,
                  });
                  return;
                }

                compressImage(compressedFile, {
                  limitSide: newLimitSide,
                  limitFile: maxFileSize,
                  format,
                  quality,
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
            quality,
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
