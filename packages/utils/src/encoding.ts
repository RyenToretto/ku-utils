/**
 * 纯 JS 实现的 Base64 解码（不依赖 window.atob，便于 Node/RN 等环境使用）
 */
export function doAtob(input: string): string {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let chr1: number;
  let chr2: number;
  let chr3: number;
  let enc1: number;
  let enc2: number;
  let enc3: number;
  let enc4: number;
  let i = 0;

  input = input.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < input.length) {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output = output + String.fromCharCode(chr1);
    if (enc3 !== 64) output = output + String.fromCharCode(chr2);
    if (enc4 !== 64) output = output + String.fromCharCode(chr3);
  }
  return output;
}

/**
 * 纯 JS 实现的 Base64 编码
 */
export function doBtoa(input: string): string {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let chr1: number;
  let chr2: number;
  let chr3: number;
  let enc1: number;
  let enc2: number;
  let enc3: number;
  let enc4: number;
  let i = 0;

  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (Number.isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (Number.isNaN(chr3)) {
      enc4 = 64;
    }

    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }

  return output;
}

/**
 * 十六进制字符串 → Uint8Array
 */
export function hexString2ByteArray(s: string): Uint8Array {
  const byteArray: number[] = [];
  for (let i = 0; i < s.length; i += 2) {
    byteArray.push(parseInt(s.substr(i, 2), 16));
  }
  return new Uint8Array(byteArray);
}

/**
 * 将字符串按「每个字符 Unicode 码点 + shift，再转十六进制（小写、两位补齐）」编码
 */
export function encodeShiftHex(input: string, shift = 2): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    result += (input.charCodeAt(i) + shift).toString(16).padStart(2, '0');
  }
  return result;
}
