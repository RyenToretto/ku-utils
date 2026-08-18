/**
 * 空值兜底展示
 * - 值为 `''`、`null`、`undefined` 时返回 replaceText（默认 `'-'`）
 * - 否则原样返回（转为字符串）
 *
 * @example
 * emptyReplace(null)           // '-'
 * emptyReplace(0)              // '0'
 * emptyReplace('', 'N/A')      // 'N/A'
 * emptyReplace('hello')        // 'hello'
 */
export function emptyReplace(value: unknown, replaceText = '-'): string {
  if (value === '' || value === null || value === undefined) {
    return replaceText;
  }
  return String(value);
}

export function camelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * 驼峰体转匈牙利命名（大写字母前加 _ 并转小写）
 * 与 snakeCase 的区别：仅处理大写字母，不转换连字符/空格，保留其他字符原样
 *
 * @example
 * transferTF('myPageName')    // => 'my_page_name'
 * transferTF('_HomeRoute')    // => '_home_route'
 * transferTF('/my-route')     // => '/my-route'（非大写字母不处理）
 */
export function transferTF(str: unknown): string {
  if (typeof str !== 'string') return str as string;
  let newStr = '';
  for (let i = 0; i < str.length; i++) {
    if (/^[A-Z]$/.test(str[i])) {
      newStr += `_${str[i].toLowerCase()}`;
    } else {
      newStr += str[i];
    }
  }
  return newStr.startsWith('_') ? newStr.slice(1) : newStr;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  const masked = name.length > 2 ? `${name.slice(0, 2)}***` : `${name[0]}***`;
  return `${masked}@${domain}`;
}

export function maskIdCard(idCard: string): string {
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2');
}

export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
}

export interface StripHtmlOptions {
  maxLength?: number;
  suffix?: string;
}

/**
 * 移除 HTML 标签，并可按字符数截断。
 */
export function stripHtml(value: unknown, options: StripHtmlOptions = {}): string {
  if (value === null || value === undefined) return '';

  const { maxLength = 0, suffix = '...' } = options;
  const text = String(value).replace(/<\/?[^<>]+>/g, '');

  if (maxLength > 0 && text.length > maxLength) {
    return `${text.slice(0, maxLength)}${suffix}`;
  }

  return text;
}

/**
 * 计算文本视觉宽度（中日文 = 1，半角英数 = 0.5）
 */
export function getTextLength(text: string): number {
  if (!text) return 0;
  let len = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x4e00 && code <= 0x9fff) {
      len += 1;
    } else if (code >= 0x3040 && code <= 0x30ff) {
      len += 1;
    } else if (code >= 0xac00 && code <= 0xd7af) {
      len += 1;
    } else if (code > 127) {
      len += 1;
    } else {
      len += 0.5;
    }
  }
  return len;
}

/**
 * 按视觉宽度截断文本（中文 1 / 半角 0.5 计）
 * 与 truncate 不同的是，truncate 按字符数，truncateText 按视觉宽度
 */
export function truncateText(text: string, maxLen: number, suffix = '...'): string {
  if (!text || maxLen <= 0) return '';
  if (getTextLength(text) <= maxLen) return text;

  let len = 0;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const chLen = getTextLength(ch);
    if (len + chLen > maxLen) break;
    len += chLen;
    result += ch;
  }
  return result + suffix;
}
