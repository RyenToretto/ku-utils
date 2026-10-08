export const CLAZZ_STATUS_ENABLED = 1;
export const CLAZZ_STATUS_ENABLED_LABEL = '启用';
export const CLAZZ_STATUS_DISABLED = 0;
export const CLAZZ_STATUS_DISABLED_LABEL = '停用';

const clazzStatus = {
  CLAZZ_STATUS_ENABLED,
  CLAZZ_STATUS_ENABLED_LABEL,
  CLAZZ_STATUS_DISABLED,
  CLAZZ_STATUS_DISABLED_LABEL,
  labelMap: {
    [CLAZZ_STATUS_ENABLED]: CLAZZ_STATUS_ENABLED_LABEL,
    [CLAZZ_STATUS_DISABLED]: CLAZZ_STATUS_DISABLED_LABEL,
  } as Record<number, string>,
  tagMap: {
    [CLAZZ_STATUS_ENABLED]: 'success',
    [CLAZZ_STATUS_DISABLED]: 'info',
  } as Record<number, string>,
  options: [
    { value: CLAZZ_STATUS_ENABLED, label: CLAZZ_STATUS_ENABLED_LABEL },
    { value: CLAZZ_STATUS_DISABLED, label: CLAZZ_STATUS_DISABLED_LABEL },
  ],
  getLabel(code: number | string | null | undefined) {
    if (code == null || code === '') return '—';
    return this.labelMap[Number(code)] || String(code);
  },
  getTagType(code: number | string | null | undefined) {
    return this.tagMap[Number(code)] || 'info';
  },
};

export default clazzStatus;
