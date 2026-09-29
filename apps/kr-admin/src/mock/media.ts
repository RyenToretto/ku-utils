/**
 * Mock 媒体 URL 池：从 assets/*.md 解析可访问的图片/视频/音频链接。
 * 用 Markdown 维护 URL，便于增删且不落 public 静态文件。
 */
import mockAudiosMd from './assets/mock-audios.md?raw';
import mockImagesMd from './assets/mock-images.md?raw';
import mockVideosMd from './assets/mock-videos.md?raw';

function parseMockMediaUrls(markdown: string): string[] {
  const urls: string[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith('#')) continue;
    if (/^https?:\/\//i.test(text)) urls.push(text);
  }
  return urls;
}

export const MOCK_IMAGE_URLS = parseMockMediaUrls(mockImagesMd);
export const MOCK_VIDEO_URLS = parseMockMediaUrls(mockVideosMd);
export const MOCK_AUDIO_URLS = parseMockMediaUrls(mockAudiosMd);

function pickFrom(list: string[], index = 0): string {
  if (!list.length) return '';
  const i = ((Math.trunc(index) % list.length) + list.length) % list.length;
  return list[i];
}

/** 按稳定下标取图（种子行推荐用下标，避免每次请求乱跳） */
export function pickMockImage(index = 0): string {
  return pickFrom(MOCK_IMAGE_URLS, index);
}

/** 按稳定下标取视频 */
export function pickMockVideo(index = 0): string {
  return pickFrom(MOCK_VIDEO_URLS, index);
}

/** 按稳定下标取音频 */
export function pickMockAudio(index = 0): string {
  return pickFrom(MOCK_AUDIO_URLS, index);
}

/** 随机取一张图（仅演示/模板场景） */
export function randomMockImage(): string {
  if (!MOCK_IMAGE_URLS.length) return '';
  return MOCK_IMAGE_URLS[Math.floor(Math.random() * MOCK_IMAGE_URLS.length)];
}

/** 随机取一个视频 */
export function randomMockVideo(): string {
  if (!MOCK_VIDEO_URLS.length) return '';
  return MOCK_VIDEO_URLS[Math.floor(Math.random() * MOCK_VIDEO_URLS.length)];
}

/** 随机取一个音频 */
export function randomMockAudio(): string {
  if (!MOCK_AUDIO_URLS.length) return '';
  return MOCK_AUDIO_URLS[Math.floor(Math.random() * MOCK_AUDIO_URLS.length)];
}
