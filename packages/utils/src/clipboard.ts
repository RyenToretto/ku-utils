function createFakeElement(value: string): HTMLTextAreaElement {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const el = document.createElement('textarea');
  el.style.fontSize = '12pt';
  el.style.border = '0';
  el.style.padding = '0';
  el.style.margin = '0';
  el.style.position = 'absolute';
  el.style[isRTL ? 'right' : 'left'] = '-9999px';
  el.style.top = `${window.pageYOffset || document.documentElement.scrollTop}px`;
  el.setAttribute('readonly', '');
  el.value = value;
  return el;
}

function setSelection(element: HTMLElement): string {
  let selectedText = '';

  if (element.nodeName === 'SELECT') {
    (element as HTMLSelectElement).focus();
    selectedText = (element as HTMLSelectElement).value;
  } else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
    const input = element as HTMLInputElement | HTMLTextAreaElement;
    const isReadOnly = input.hasAttribute('readonly');
    if (!isReadOnly) input.setAttribute('readonly', '');
    input.select();
    input.setSelectionRange(0, input.value.length);
    if (!isReadOnly) input.removeAttribute('readonly');
    selectedText = input.value;
  } else {
    if (element.hasAttribute('contenteditable')) element.focus();
    const selection = window.getSelection();
    if (!selection) return '';
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    selectedText = selection.toString();
  }

  return selectedText;
}

function fallbackCopy(text: string): void {
  const el = createFakeElement(text);
  document.body.appendChild(el);
  setSelection(el);
  document.execCommand('copy');
  document.body.removeChild(el);
}

/**
 * 复制文本到剪贴板（优先 Clipboard API，失败降级 execCommand）
 *
 * 与 navigator.clipboard 直接调用相比，本函数在以下场景仍可工作：
 *   - 非 HTTPS 环境
 *   - 不支持 Clipboard API 的旧浏览器
 *   - Clipboard API 因权限被拒绝
 */
export async function setCopy(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* fallback */
    }
  }
  fallbackCopy(text);
}
