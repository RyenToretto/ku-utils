export interface StaticVersion {
  version: string;
  versionTime: string;
  versionTimeISO: string;
}

function resolveVersionUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  return `${base}/data/version.json?_t=${Date.now()}`;
}

/** 拉取 admin 的静态版本文件（用于运行时更新检测） */
export async function fetchStaticVersion(
  baseUrl = import.meta.env.BASE_URL || '/',
): Promise<StaticVersion | null> {
  try {
    const res = await fetch(resolveVersionUrl(baseUrl));
    if (!res.ok) return null;
    return (await res.json()) as StaticVersion;
  } catch {
    return null;
  }
}
