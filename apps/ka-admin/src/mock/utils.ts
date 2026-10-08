/** 巨效 DSP 统一响应信封：code === 0 表示成功 */
export const defaultSuccess = {
  code: 0,
  message: 'success',
  data: {},
};

export const defaultFail = {
  code: 2002,
  message: 'mock错误',
  data: null,
};

export function ok<T>(data: T, message = 'success') {
  return { code: 0, message, data };
}

export function pageOk<T>(lists: T[], total?: number) {
  return ok({
    lists,
    total: total ?? lists.length,
  });
}

export function parsePageQuery(
  query: Record<string, string | undefined> | Record<string, unknown>,
) {
  const pageNum = Math.max(1, Number(query.pageNum || query.pageNo || 1) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(query.pageSize || 10) || 10));
  return { pageNum, pageSize };
}

/**
 * 分页 + 其余筛选键。禁止对 `parsePageQuery` 做 `...rest`（返回类型无多余字段，rest 会被推断为 `{}`）。
 */
export function splitPageQuery(query: Record<string, string>) {
  const { pageNum, pageSize } = parsePageQuery(query);
  const filters: Record<string, string> = { ...query };
  delete filters.pageNum;
  delete filters.pageNo;
  delete filters.pageSize;
  return { pageNum, pageSize, filters };
}

export function slicePage<T>(lists: T[], pageNum: number, pageSize: number) {
  const start = (pageNum - 1) * pageSize;
  return lists.slice(start, start + pageSize);
}

export {
  MOCK_AUDIO_URLS,
  MOCK_IMAGE_URLS,
  MOCK_VIDEO_URLS,
  pickMockAudio,
  pickMockImage,
  pickMockVideo,
  randomMockAudio,
  randomMockImage,
  randomMockVideo,
} from './media';
