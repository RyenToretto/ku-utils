const DEFAULT_SOURCE_KEY = 'source';

const SOURCE_CHANNELS = [
  'unity',
  'csj',
  'Organic',
  'juwin',
  'gdt',
  'baidu',
  'ks',
  'qq',
  'huawei',
  'bes',
  'oppo',
  'vivo',
  's360',
  'xiaomi',
  'facebook',
  'appchina',
  'Organic-csj',
  'Organic-baidu',
  'Organic-gdt',
  'Organic-ks',
  'Organic-facebook',
  'invite',
  'baidumat',
  'FL-dl',
  'google',
  'tiktok',
  'xatool',
  'dl_qk_shunfei',
  'mintegral',
  'applovin',
  'fn',
  'applifier',
  'kwai',
  'DL',
  'dl',
  'bigo',
  'ironsource',
  'ios',
  'moloco',
  'bpbkol',
  'yandex',
  'mistplay',
  'taurusx',
  'appnext',
  'xm',
  'snapchat',
  'gadmobe',
  'cmkol',
  'offline',
  'fyber',
  'wzkol',
  'aikemei',
  'google-web2app',
  'fogfly',
  'bdw',
  'xingtu',
  'rongyao',
  'oppo_os',
  'Organic-tiktok',
  'jinghong',
  'TECNO',
  'huichuan',
  'xiaohongshu',
  'bilibili',
  'taptap',
  'old_organic',
  'sigmob',
  'vivo_os',
  'newsbreak',
  'google_ads',
  'soul',
] as const;

const SOURCE_CHANNEL_MAP = new Map(
  SOURCE_CHANNELS.map((channel) => [channel.toLowerCase(), channel]),
);
const SOURCE_CHANNEL_SET = new Set<string>(SOURCE_CHANNELS);

function toStringValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeSourceKeys(sourceKeys?: string[]): string[] {
  const keys = sourceKeys?.length ? sourceKeys : [DEFAULT_SOURCE_KEY];
  const normalizedKeys = [...keys, DEFAULT_SOURCE_KEY].map((key) => key.trim()).filter(Boolean);
  return Array.from(new Set(normalizedKeys));
}

export function normalizeSourceChannel(value: unknown): string | undefined {
  const source = toStringValue(value);
  if (!source) return undefined;
  if (SOURCE_CHANNEL_SET.has(source)) return source;
  return SOURCE_CHANNEL_MAP.get(source.toLowerCase()) ?? source;
}

export function resolveSourceFromParams(
  params: Record<string, unknown>,
  sourceKeys: string[],
): string | undefined {
  for (const key of normalizeSourceKeys(sourceKeys)) {
    const source = normalizeSourceChannel(params[key]);
    if (source) return source;
  }
  return undefined;
}
