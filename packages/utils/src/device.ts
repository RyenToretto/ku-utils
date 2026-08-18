export interface BrowserInfo {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceName: string;
  dpi: number;
  lang: string;
  deviceWidth: number;
  deviceHeight: number;
  model: string;
}

export interface BrowserSupport {
  isChrome: boolean;
  isEdge: boolean;
  supportsFedCM: boolean;
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type OSType = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

export interface DeviceDetectResult {
  isPc: boolean;
  isPhone: boolean;
}

/**
 * 检测浏览器对 Chrome/Edge/FedCM 的支持
 */
export function detectBrowserSupport(): BrowserSupport {
  if (typeof window === 'undefined' || !window.navigator) {
    return { isChrome: false, isEdge: false, supportsFedCM: false };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
  const isEdge = userAgent.includes('edg');
  const supportsFedCM = isChrome || isEdge;
  return { isChrome, isEdge, supportsFedCM };
}

/**
 * 解析 UA，输出浏览器/系统/设备综合信息
 */
export function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      browserName: 'ssr',
      browserVersion: 'ssr',
      osName: 'ssr',
      osVersion: 'ssr',
      deviceName: 'ssr',
      model: 'ssr',
      dpi: 96,
      lang: 'ssr',
      deviceWidth: 1920,
      deviceHeight: 1080,
    };
  }

  const browserReg: Record<string, RegExp> = {
    Chrome: /Chrome/,
    IE: /MSIE/,
    Firefox: /Firefox/,
    Opera: /Presto/,
    Safari: /Version\/([\d.]+).*Safari/,
    360: /360SE/,
    QQBrowser: /QQ/,
    Edge: /Edg/,
  };

  const deviceReg: Record<string, RegExp> = {
    iPhone: /iPhone/,
    iPad: /iPad/,
    Android: /Android/,
    Windows: /Windows/,
    Mac: /Macintosh/,
  };

  const userAgentStr = navigator.userAgent;
  const result: BrowserInfo = {
    browserName: '',
    browserVersion: '',
    osName: '',
    osVersion: '',
    deviceName: '',
    model: '',
    dpi: 96,
    lang: navigator.language,
    deviceWidth: window.screen.width || 1920,
    deviceHeight: window.screen.height || 1080,
  };

  try {
    for (const key in browserReg) {
      if (browserReg[key].test(userAgentStr)) {
        result.browserName = key;
        if (key === 'Chrome') {
          result.browserVersion = userAgentStr.split('Chrome/')[1]?.split(' ')[0] || '';
        } else if (key === 'IE') {
          result.browserVersion = userAgentStr.split('MSIE ')[1]?.split(' ')[1] || '';
        } else if (key === 'Firefox') {
          result.browserVersion = userAgentStr.split('Firefox/')[1] || '';
        } else if (key === 'Opera') {
          result.browserVersion = userAgentStr.split('Version/')[1] || '';
        } else if (key === 'Safari') {
          result.browserVersion = userAgentStr.split('Version/')[1]?.split(' ')[0] || '';
        } else if (key === 'QQBrowser') {
          result.browserVersion = userAgentStr.split('Version/')[1]?.split(' ')[0] || '';
        } else if (key === 'Edge') {
          result.browserVersion = userAgentStr.split('Edg/')[1]?.split(' ')[0] || '';
        }
      }
    }

    for (const key in deviceReg) {
      if (deviceReg[key].test(userAgentStr)) {
        result.osName = key;
        if (key === 'Windows') {
          result.osVersion = userAgentStr.split('Windows NT ')[1]?.split(';')[0] || '';
        } else if (key === 'Mac') {
          result.osVersion = userAgentStr.split('Mac OS X ')[1]?.split(')')[0] || '';
        } else if (key === 'iPhone') {
          result.osVersion = userAgentStr.split('iPhone OS ')[1]?.split(' ')[0] || '';
        } else if (key === 'iPad') {
          result.osVersion = userAgentStr.split('iPad; CPU OS ')[1]?.split(' ')[0] || '';
        } else if (key === 'Android') {
          result.osVersion = userAgentStr.split('Android ')[1]?.split(';')[0] || '';
          const deviceInfo =
            userAgentStr.split('(Linux; Android ')[1]?.split('; ')[1]?.split(' Build')[0] || '';
          result.deviceName = deviceInfo;
          result.model = deviceInfo;
        }
      }
    }

    result.dpi = result.dpi * window.devicePixelRatio;
  } catch {
    // ignore
  }

  return result;
}

export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'desktop';
  const userAgent = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

export function getOSType(): OSType {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'unknown';
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  if (/android/i.test(userAgent)) return 'android';
  if (/windows/i.test(userAgent)) return 'windows';
  if (/macintosh|mac os x/i.test(userAgent)) return 'macos';
  if (/linux/i.test(userAgent)) return 'linux';
  return 'unknown';
}

export function isMobile(): boolean {
  return getDeviceType() === 'mobile';
}

export function isTablet(): boolean {
  return getDeviceType() === 'tablet';
}

export function isDesktop(): boolean {
  return getDeviceType() === 'desktop';
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isIOS(): boolean {
  return getOSType() === 'ios';
}

export function isAndroid(): boolean {
  return getOSType() === 'android';
}

export function isSafari(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome');
}

export function isWechat(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /micromessenger/i.test(navigator.userAgent);
}

/**
 * 是否 PC / 是否手机（含 768px 阈值）
 */
export function detectDevice(): DeviceDetectResult {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isPc: true, isPhone: false };
  }
  const ua =
    navigator.userAgent ||
    navigator.vendor ||
    ((window as unknown as { opera?: string }).opera ?? '');
  const isPhone = /iPhone|iPad|iPod|Android/i.test(ua);
  const screenWidth = window.innerWidth;
  return {
    isPc: !isPhone && screenWidth > 768,
    isPhone: isPhone || screenWidth <= 768,
  };
}

/**
 * 检测微信/QQ 环境，给 body 加 'is-we-chat' className
 */
export function checkWeChat(): void {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') return;
  try {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('micromessenger') || ua.includes('qq')) {
      document.body.classList.add('is-we-chat');
    }
  } catch {
    // ignore
  }
}
