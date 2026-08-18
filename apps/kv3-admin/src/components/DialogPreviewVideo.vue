<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="dialogWidth"
    class="dialog-preview-video"
    append-to-body
    destroy-on-close
    align-center
    @closed="resetPanel"
  >
    <div
      v-if="isAudio"
      class="dialog-preview-video-audio"
    >
      <audio
        ref="playerRef"
        :src="mediaUrl"
        preload="auto"
        loop
        controls
      />
      <div class="dialog-preview-video-link">{{ mediaUrl }}</div>
    </div>
    <video
      v-else
      ref="playerRef"
      class="dialog-preview-video-player"
      :src="mediaUrl"
      controls
      muted
      playsinline
    />

    <div
      v-if="!isAudio && hasMediaMeta"
      class="dialog-preview-video-meta"
    >
      <div
        v-if="mediaInfo.width && mediaInfo.height"
        class="dialog-preview-video-meta-item"
      >
        <span class="dialog-preview-video-meta-label">分辨率：</span>
        <span class="dialog-preview-video-meta-value">
          {{ mediaInfo.width }} x {{ mediaInfo.height }}
        </span>
      </div>
      <div
        v-if="mediaInfo.duration != null"
        class="dialog-preview-video-meta-item"
      >
        <span class="dialog-preview-video-meta-label">时长：</span>
        <span class="dialog-preview-video-meta-value">{{ Math.round(mediaInfo.duration) }}s</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue';

import { isAudioUrl, type PreviewMediaRaw } from '@/utils/previewMedia';

defineOptions({ name: 'DialogPreviewVideo' });

type MediaInfo = {
  width?: number;
  height?: number;
  duration?: number;
};

const dialogVisible = ref(false);
const mediaUrl = ref('');
const isAudio = ref(false);
const rawInfo = ref<PreviewMediaRaw>({});
const mediaInfo = reactive<MediaInfo>({});
const playerRef = ref<HTMLVideoElement | HTMLAudioElement | null>(null);

const dialogTitle = computed(() => {
  if (rawInfo.value.name) return String(rawInfo.value.name);
  return isAudio.value ? '音频预览' : '视频预览';
});

const orientationClass = computed(() => {
  const w = Number(mediaInfo.width || rawInfo.value.width || 0);
  const h = Number(mediaInfo.height || rawInfo.value.height || 0);
  if (w > 0 && h > 0 && h > w) return 'is-portrait';
  return 'is-landscape';
});

const dialogWidth = computed(() => (orientationClass.value === 'is-portrait' ? '500px' : '800px'));
const hasMediaMeta = computed(
  () => (mediaInfo.width != null && mediaInfo.height != null) || mediaInfo.duration != null,
);

function clearMediaInfo() {
  mediaInfo.width = undefined;
  mediaInfo.height = undefined;
  mediaInfo.duration = undefined;
}

function doPause() {
  try {
    playerRef.value?.pause?.();
  } catch {
    /* empty */
  }
}

async function doPlay() {
  try {
    const el = playerRef.value;
    if (!el) return;
    if ('muted' in el) el.muted = false;
    await el.play?.();
  } catch {
    /* 自动播放策略可能拦截，保留 controls 供手动播放 */
  }
}

function detectAudio(url: string, raw?: PreviewMediaRaw) {
  const type = String(raw?.type || '').toUpperCase();
  if (type === 'AUDIO') return true;
  if (type === 'VIDEO' || type === 'IMAGE') return false;
  return isAudioUrl(url);
}

function applyRawMeta(raw?: PreviewMediaRaw) {
  clearMediaInfo();
  if (raw?.width != null && Number(raw.width) > 0) mediaInfo.width = Number(raw.width);
  if (raw?.height != null && Number(raw.height) > 0) mediaInfo.height = Number(raw.height);
  if (raw?.videoDuration != null && !Number.isNaN(Number(raw.videoDuration))) {
    mediaInfo.duration = Number(raw.videoDuration);
  }
}

async function loadVideoMetaFromElement() {
  const el = playerRef.value;
  if (!el || !('videoWidth' in el)) return;
  await new Promise<void>((resolve) => {
    const video = el as HTMLVideoElement;
    if (video.readyState >= 1) {
      resolve();
      return;
    }
    const onMeta = () => {
      video.removeEventListener('loadedmetadata', onMeta);
      resolve();
    };
    video.addEventListener('loadedmetadata', onMeta);
  });
  const video = el as HTMLVideoElement;
  if (video.videoWidth) mediaInfo.width = video.videoWidth;
  if (video.videoHeight) mediaInfo.height = video.videoHeight;
  if (Number.isFinite(video.duration) && video.duration > 0) {
    mediaInfo.duration = video.duration;
  }
}

function resetPanel() {
  doPause();
  mediaUrl.value = '';
  isAudio.value = false;
  rawInfo.value = {};
  clearMediaInfo();
}

async function play(url: string, raw: PreviewMediaRaw = {}) {
  mediaUrl.value = url;
  rawInfo.value = raw || {};
  isAudio.value = detectAudio(url, raw);
  applyRawMeta(raw);
  dialogVisible.value = true;
  await nextTick();
  if (!isAudio.value) {
    try {
      await loadVideoMetaFromElement();
    } catch {
      /* empty */
    }
  }
  await nextTick();
  await doPlay();
}

defineExpose({ play });
</script>

<style lang="scss" scoped>
.dialog-preview-video-audio {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 12px 16px;
}

.dialog-preview-video-audio > audio {
  box-sizing: border-box;
  width: 100%;
}

.dialog-preview-video-link {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
}

.dialog-preview-video-player {
  display: block;
  width: 100%;
  max-height: 60vh;
  margin: 0 auto;
  background: #333;
}

.dialog-preview-video-meta {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: var(--el-border-radius-base);
  background: var(--el-fill-color-light);
}

.dialog-preview-video-meta-item {
  display: inline-flex;
  align-items: baseline;
  font-size: 13px;
  line-height: 1.4;
}

.dialog-preview-video-meta-label {
  color: var(--el-text-color-secondary);
}

.dialog-preview-video-meta-value {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>

<style lang="scss">
.dialog-preview-video .el-dialog__body {
  padding: 8px 12px 16px;
}
</style>
