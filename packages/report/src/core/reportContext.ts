/**
 * 合并上报 ext / attributes 中的公共片段
 */
export function buildMergedExtPayload(
  moreParams: Record<string, unknown>,
  logIdParams: Record<string, unknown>,
  urlParams: Record<string, unknown>,
  ext: Record<string, unknown>,
  logidUrl: string,
): Record<string, unknown> {
  return {
    ...moreParams,
    ...logIdParams,
    ...urlParams,
    ...ext,
    logidUrl,
  };
}
