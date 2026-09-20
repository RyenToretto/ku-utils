<template>
  <div class="page-ui-kit-preview-video">
    <PageHeader subtitle="通过 openPreviewVideo 打开全局 DialogPreviewVideo 宿主。" />

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>打开预览</h3>
      <div class="ui-kit-demo-row">
        <el-button
          type="primary"
          @click="openLandscape"
        >
          横屏视频
        </el-button>
        <el-button @click="openPortrait">竖屏视频</el-button>
        <el-button @click="openAudio">音频</el-button>
      </div>
      <p class="ui-kit-demo-hint">使用公开样例资源，仅 Demo 演示；业务页传入真实 CDN URL。</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { openPreviewVideo } from '@/utils/previewMedia';

/** 公开样例资源，仅 Demo 演示宿主调用 */
const SAMPLE_LANDSCAPE = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
/** 竖屏样例（360×640）；加载失败时仍可凭 raw 尺寸走竖屏画幅 */
const SAMPLE_PORTRAIT =
  'https://videos.pexels.com/video-files/3571264/3571264-sd_360_640_30fps.mp4';
const SAMPLE_AUDIO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

function openLandscape() {
  openPreviewVideo(SAMPLE_LANDSCAPE, {
    name: '横屏视频',
    type: 'VIDEO',
    width: 1280,
    height: 720,
    videoDuration: 5,
  });
}

function openPortrait() {
  openPreviewVideo(SAMPLE_PORTRAIT, {
    name: '竖屏视频',
    type: 'VIDEO',
    width: 360,
    height: 640,
    videoDuration: 8,
  });
}

function openAudio() {
  openPreviewVideo(SAMPLE_AUDIO, {
    name: '音频',
    type: 'AUDIO',
  });
}
</script>

<style lang="scss" scoped>
.page-ui-kit-preview-video {
  box-sizing: border-box;
}

.ui-kit-demo-card {
  margin-top: 12px;

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
  }
}

.ui-kit-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ui-kit-demo-hint {
  margin: 8px 0 0;
  color: var(--ku-text-secondary, var(--el-text-color-secondary));
  font-size: 12px;
}
</style>
