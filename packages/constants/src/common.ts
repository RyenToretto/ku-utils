export enum StorageKey {
  TOKEN = 'ku_utils_token',
  REFRESH_TOKEN = 'ku_utils_refresh_token',
  USER_INFO = 'ku_utils_user_info',
  LANGUAGE = 'ku_utils_language',
  THEME = 'ku_utils_theme',
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

export const FILE_SIZE_LIMIT = {
  IMAGE: 5 * 1024 * 1024,
  DOCUMENT: 20 * 1024 * 1024,
  VIDEO: 200 * 1024 * 1024,
  AVATAR: 2 * 1024 * 1024,
} as const;

export const FILE_ACCEPT = {
  IMAGE: '.jpg,.jpeg,.png,.gif,.webp,.svg',
  DOCUMENT: '.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt',
  VIDEO: '.mp4,.avi,.mov,.wmv,.mkv',
  AUDIO: '.mp3,.wav,.flac,.aac',
  EXCEL: '.xls,.xlsx,.csv',
} as const;

export const FILE_TYPE = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
  DOCUMENT: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'flv', 'webm'],
  AUDIO: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
  CODE: ['js', 'ts', 'vue', 'jsx', 'tsx', 'css', 'scss', 'html', 'json', 'md'],
} as const;

export type FileCategory = keyof typeof FILE_TYPE;

/**
 * 根据文件扩展名获取文件类别
 * @param ext - 文件扩展名（不含点号）
 * @returns 文件类别，未匹配则返回 undefined
 */
export function getFileCategory(ext: string): FileCategory | undefined {
  const lowerExt = ext.toLowerCase();
  for (const [category, extensions] of Object.entries(FILE_TYPE)) {
    if ((extensions as readonly string[]).includes(lowerExt)) {
      return category as FileCategory;
    }
  }
  return undefined;
}
