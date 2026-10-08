/**
 * 全局音视频预览宿主（App 挂载 DialogPreviewVideo 后注册）。
 * 用法：`openPreviewVideo(url, raw?)`。
 */
export type PreviewMediaRaw = {
  width?: number | null;
  height?: number | null;
  videoDuration?: number | null;
  name?: string | null;
  /** IMAGE / VIDEO / AUDIO；也可由 url 后缀推断 */
  type?: string | null;
};

export type PreviewVideoHost = {
  play: (url: string, raw?: PreviewMediaRaw) => void;
};

let previewVideoHost: PreviewVideoHost | null = null;

export function registerPreviewVideoHost(host: PreviewVideoHost | null) {
  previewVideoHost = host;
}

export function openPreviewVideo(url: string, raw?: PreviewMediaRaw) {
  const mediaUrl = String(url || '').trim();
  if (!mediaUrl) return;
  if (!previewVideoHost) {
    console.warn('[previewMedia] DialogPreviewVideo 尚未挂载');
    return;
  }
  previewVideoHost.play(mediaUrl, raw);
}

export function isAudioUrl(url: string): boolean {
  const path = String(url || '')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase();
  return /\.(mp3|wav|aac|m4a|ogg|flac|wma)$/i.test(path);
}

export function isVideoUrl(url: string): boolean {
  const path = String(url || '')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase();
  return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(path);
}
