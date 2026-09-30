import { Button, Card } from 'antd';

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

export default function UiKitPreviewVideoDemo() {
  return (
    <div className="page-ui-kit-preview-video">
      <Card
        size="small"
        className="ui-kit-demo-card"
      >
        <h3>打开预览</h3>
        <div className="ui-kit-demo-row">
          <Button
            type="primary"
            onClick={openLandscape}
          >
            横屏视频
          </Button>
          <Button onClick={openPortrait}>竖屏视频</Button>
          <Button onClick={openAudio}>音频</Button>
        </div>
        <p className="ui-kit-demo-hint">使用公开样例资源，仅 Demo 演示；业务页传入真实 CDN URL。</p>
      </Card>
    </div>
  );
}
