import { checkWeChat } from '@ku-utils/utils';

const STORE_PREFIXES = ['https://play.google.com/', 'http://play.google.com/'];

/**
 * 通过表单提交触发下载
 *   - 在微信内自动给 body 加 'is-we-chat' className 以便提示用户
 *   - Google Play 直接跳转（避免 form submit 造成的兼容问题）
 */
export function makeDownload(
  url: string,
  data: Record<string, string> = {},
  method: 'GET' | 'POST' = 'GET',
): void {
  checkWeChat();

  if (STORE_PREFIXES.some((p) => url.startsWith(p))) {
    window.location.href = url;
    return;
  }

  const form = document.createElement('form');
  form.method = method;
  form.action = url;

  for (const [key, value] of Object.entries(data)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
