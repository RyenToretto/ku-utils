import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { isAudioUrl, registerPreviewVideoHost, type PreviewMediaRaw } from '@/utils/preview-media';

type MediaInfo = {
  width?: number;
  height?: number;
  duration?: number;
};

function detectAudio(url: string, raw?: PreviewMediaRaw) {
  const type = String(raw?.type || '').toUpperCase();
  if (type === 'AUDIO') return true;
  if (type === 'VIDEO' || type === 'IMAGE') return false;
  return isAudioUrl(url);
}

function applyRawMeta(raw?: PreviewMediaRaw): MediaInfo {
  const info: MediaInfo = {};
  if (raw?.width != null && Number(raw.width) > 0) info.width = Number(raw.width);
  if (raw?.height != null && Number(raw.height) > 0) info.height = Number(raw.height);
  if (raw?.videoDuration != null && !Number.isNaN(Number(raw.videoDuration))) {
    info.duration = Number(raw.videoDuration);
  }
  return info;
}

/** kr body `8px 12px 16px` 外还有 antd v5 内容区 16 内边距；nz 无该层，左右与底部并入 body */
const BODY_STYLE = { padding: '8px 28px 32px' };

async function doPlay(el: HTMLVideoElement | HTMLAudioElement) {
  try {
    el.muted = false;
    await el.play();
  } catch {
    /* 自动播放策略可能拦截，保留 controls 供手动播放 */
  }
}

/** 全局音视频预览弹窗（App 挂载一次并注册为 `openPreviewVideo` 宿主），对齐 kv3 / kr。 */
@Component({
  selector: 'ka-dialog-preview-video',
  imports: [NzModalModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-modal
      nzClassName="dialog-preview-video"
      nzCentered
      [nzVisible]="visible()"
      [nzTitle]="dialogTitle()"
      [nzWidth]="dialogWidth()"
      [nzFooter]="null"
      [nzBodyStyle]="bodyStyle"
      (nzOnCancel)="visible.set(false)"
      (nzAfterClose)="resetPanel()"
    >
      <ng-container *nzModalContent>
        @if (isAudio()) {
          <div class="dialog-preview-video-audio">
            <audio
              #player
              preload="auto"
              loop
              controls
              style="width: 100%"
              [src]="mediaUrl()"
            ></audio>
            <div class="dialog-preview-video-link">{{ mediaUrl() }}</div>
          </div>
        } @else {
          <video
            #player
            class="dialog-preview-video-player"
            controls
            muted
            playsinline
            [src]="mediaUrl()"
            (loadedmetadata)="onVideoMeta($event)"
          ></video>
        }

        @if (!isAudio() && hasMediaMeta()) {
          <div class="dialog-preview-video-meta">
            @if (mediaInfo().width && mediaInfo().height) {
              <div class="dialog-preview-video-meta-item">
                <span class="dialog-preview-video-meta-label">分辨率：</span>
                <span class="dialog-preview-video-meta-value">
                  {{ mediaInfo().width }} x {{ mediaInfo().height }}
                </span>
              </div>
            }
            @if (mediaInfo().duration !== undefined) {
              <div class="dialog-preview-video-meta-item">
                <span class="dialog-preview-video-meta-label">时长：</span>
                <span class="dialog-preview-video-meta-value">{{ durationText() }}s</span>
              </div>
            }
          </div>
        }
      </ng-container>
    </nz-modal>
  `,
})
export class DialogPreviewVideo {
  protected readonly bodyStyle = BODY_STYLE;
  protected readonly visible = signal(false);
  protected readonly mediaUrl = signal('');
  protected readonly isAudio = signal(false);
  private readonly rawInfo = signal<PreviewMediaRaw>({});
  protected readonly mediaInfo = signal<MediaInfo>({});
  private readonly player = viewChild<ElementRef<HTMLVideoElement | HTMLAudioElement>>('player');

  protected readonly dialogTitle = computed(() => {
    const name = this.rawInfo().name;
    if (name) return String(name);
    return this.isAudio() ? '音频预览' : '视频预览';
  });
  protected readonly dialogWidth = computed(() => {
    const raw = this.rawInfo();
    const info = this.mediaInfo();
    const w = Number(info.width || raw.width || 0);
    const h = Number(info.height || raw.height || 0);
    return w > 0 && h > 0 && h > w ? 500 : 800;
  });
  protected readonly hasMediaMeta = computed(() => {
    const info = this.mediaInfo();
    return (info.width != null && info.height != null) || info.duration != null;
  });
  protected readonly durationText = computed(() => Math.round(this.mediaInfo().duration ?? 0));

  constructor() {
    registerPreviewVideoHost({ play: (url, raw) => this.play(url, raw) });
    inject(DestroyRef).onDestroy(() => registerPreviewVideoHost(null));

    /** Modal 内容挂载后才有播放器节点，在挂载时机起播 */
    effect(() => {
      const el = this.player()?.nativeElement;
      if (el) void doPlay(el);
    });
  }

  play(url: string, raw: PreviewMediaRaw = {}) {
    this.mediaUrl.set(url);
    this.rawInfo.set(raw || {});
    this.isAudio.set(detectAudio(url, raw));
    this.mediaInfo.set(applyRawMeta(raw));
    this.visible.set(true);
  }

  protected onVideoMeta(event: Event) {
    const video = event.currentTarget as HTMLVideoElement;
    this.mediaInfo.update((prev) => {
      const next = { ...prev };
      if (video.videoWidth) next.width = video.videoWidth;
      if (video.videoHeight) next.height = video.videoHeight;
      if (Number.isFinite(video.duration) && video.duration > 0) next.duration = video.duration;
      return next;
    });
  }

  protected resetPanel() {
    try {
      this.player()?.nativeElement.pause();
    } catch {
      /* empty */
    }
    this.mediaUrl.set('');
    this.isAudio.set(false);
    this.rawInfo.set({});
    this.mediaInfo.set({});
  }
}
