import { Modal } from 'antd';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { isAudioUrl, type PreviewMediaRaw } from '@/utils/previewMedia';

type MediaInfo = {
  width?: number;
  height?: number;
  duration?: number;
};

export type DialogPreviewVideoRef = {
  play: (url: string, raw?: PreviewMediaRaw) => void;
};

function clearMediaInfo(): MediaInfo {
  return {};
}

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

async function doPlay(el: HTMLVideoElement | HTMLAudioElement) {
  try {
    el.muted = false;
    await el.play();
  } catch {
    /* 自动播放策略可能拦截，保留 controls 供手动播放 */
  }
}

const DialogPreviewVideo = forwardRef<DialogPreviewVideoRef>(function DialogPreviewVideo(_, ref) {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isAudio, setIsAudio] = useState(false);
  const [rawInfo, setRawInfo] = useState<PreviewMediaRaw>({});
  const [mediaInfo, setMediaInfo] = useState<MediaInfo>({});
  const playerRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  /** Modal 内容挂载后才有播放器节点，在挂载时机起播 */
  const setPlayerRef = useCallback((el: HTMLVideoElement | HTMLAudioElement | null) => {
    playerRef.current = el;
    if (el) void doPlay(el);
  }, []);

  const dialogTitle = useMemo(() => {
    if (rawInfo.name) return String(rawInfo.name);
    return isAudio ? '音频预览' : '视频预览';
  }, [rawInfo.name, isAudio]);

  const dialogWidth = useMemo(() => {
    const w = Number(mediaInfo.width || rawInfo.width || 0);
    const h = Number(mediaInfo.height || rawInfo.height || 0);
    const isPortrait = w > 0 && h > 0 && h > w;
    return isPortrait ? 500 : 800;
  }, [mediaInfo.width, mediaInfo.height, rawInfo.width, rawInfo.height]);

  const hasMediaMeta =
    (mediaInfo.width != null && mediaInfo.height != null) || mediaInfo.duration != null;

  function doPause() {
    try {
      playerRef.current?.pause?.();
    } catch {
      /* empty */
    }
  }

  function onVideoMeta(e: React.SyntheticEvent<HTMLVideoElement>) {
    const video = e.currentTarget;
    setMediaInfo((prev) => {
      const next = { ...prev };
      if (video.videoWidth) next.width = video.videoWidth;
      if (video.videoHeight) next.height = video.videoHeight;
      if (Number.isFinite(video.duration) && video.duration > 0) {
        next.duration = video.duration;
      }
      return next;
    });
  }

  function resetPanel() {
    doPause();
    setMediaUrl('');
    setIsAudio(false);
    setRawInfo({});
    setMediaInfo(clearMediaInfo());
  }

  const play = useCallback((url: string, raw: PreviewMediaRaw = {}) => {
    setMediaUrl(url);
    setRawInfo(raw || {});
    setIsAudio(detectAudio(url, raw));
    setMediaInfo(applyRawMeta(raw));
    setDialogVisible(true);
  }, []);

  useImperativeHandle(ref, () => ({ play }), [play]);

  return (
    <Modal
      className="dialog-preview-video"
      open={dialogVisible}
      title={dialogTitle}
      width={dialogWidth}
      centered
      destroyOnHidden
      footer={null}
      onCancel={() => setDialogVisible(false)}
      afterClose={resetPanel}
      styles={{ body: { padding: '8px 12px 16px' } }}
    >
      {isAudio ? (
        <div className="dialog-preview-video-audio">
          <audio
            ref={setPlayerRef}
            src={mediaUrl}
            preload="auto"
            loop
            controls
            style={{ width: '100%' }}
          />
          <div className="dialog-preview-video-link">{mediaUrl}</div>
        </div>
      ) : (
        <video
          ref={setPlayerRef}
          className="dialog-preview-video-player"
          src={mediaUrl}
          controls
          muted
          playsInline
          onLoadedMetadata={onVideoMeta}
        />
      )}

      {!isAudio && hasMediaMeta ? (
        <div className="dialog-preview-video-meta">
          {mediaInfo.width && mediaInfo.height ? (
            <div className="dialog-preview-video-meta-item">
              <span className="dialog-preview-video-meta-label">分辨率：</span>
              <span className="dialog-preview-video-meta-value">
                {mediaInfo.width} x {mediaInfo.height}
              </span>
            </div>
          ) : null}
          {mediaInfo.duration != null ? (
            <div className="dialog-preview-video-meta-item">
              <span className="dialog-preview-video-meta-label">时长：</span>
              <span className="dialog-preview-video-meta-value">
                {Math.round(mediaInfo.duration)}s
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
});

export default DialogPreviewVideo;
