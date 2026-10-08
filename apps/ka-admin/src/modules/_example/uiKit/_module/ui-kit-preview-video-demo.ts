import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';

import { openPreviewVideo } from '@/utils/preview-media';

/** 公开样例资源，仅 Demo 演示宿主调用 */
const SAMPLE_LANDSCAPE = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
/** 竖屏样例（360×640）；加载失败时仍可凭 raw 尺寸走竖屏画幅 */
const SAMPLE_PORTRAIT =
  'https://videos.pexels.com/video-files/3571264/3571264-sd_360_640_30fps.mp4';
const SAMPLE_AUDIO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

@Component({
  selector: 'ka-ui-kit-preview-video-demo',
  imports: [NzButtonModule, NzCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-ui-kit-preview-video' },
  template: `
    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>打开预览</h3>
      <div class="ui-kit-demo-row">
        <button
          nz-button
          nzType="primary"
          (click)="openLandscape()"
        >
          横屏视频
        </button>
        <button
          nz-button
          (click)="openPortrait()"
        >
          竖屏视频
        </button>
        <button
          nz-button
          (click)="openAudio()"
        >
          音频
        </button>
      </div>
      <p class="ui-kit-demo-hint">使用公开样例资源，仅 Demo 演示；业务页传入真实 CDN URL。</p>
    </nz-card>
  `,
})
export default class UiKitPreviewVideoDemo {
  protected openLandscape() {
    openPreviewVideo(SAMPLE_LANDSCAPE, {
      name: '横屏视频',
      type: 'VIDEO',
      width: 1280,
      height: 720,
      videoDuration: 5,
    });
  }

  protected openPortrait() {
    openPreviewVideo(SAMPLE_PORTRAIT, {
      name: '竖屏视频',
      type: 'VIDEO',
      width: 360,
      height: 640,
      videoDuration: 8,
    });
  }

  protected openAudio() {
    openPreviewVideo(SAMPLE_AUDIO, { name: '音频', type: 'AUDIO' });
  }
}
