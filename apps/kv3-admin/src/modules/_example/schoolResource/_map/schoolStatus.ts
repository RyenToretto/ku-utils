export const SCHOOL_STATUS_ENABLED = 1;
export const SCHOOL_STATUS_ENABLED_LABEL = '启用';
export const SCHOOL_STATUS_DISABLED = 0;
export const SCHOOL_STATUS_DISABLED_LABEL = '停用';

const schoolStatus = {
  SCHOOL_STATUS_ENABLED,
  SCHOOL_STATUS_ENABLED_LABEL,
  SCHOOL_STATUS_DISABLED,
  SCHOOL_STATUS_DISABLED_LABEL,
  labelMap: {
    [SCHOOL_STATUS_ENABLED]: SCHOOL_STATUS_ENABLED_LABEL,
    [SCHOOL_STATUS_DISABLED]: SCHOOL_STATUS_DISABLED_LABEL,
  } as Record<number, string>,
  tagMap: {
    [SCHOOL_STATUS_ENABLED]: 'success',
    [SCHOOL_STATUS_DISABLED]: 'info',
  } as Record<number, string>,
  options: [
    { value: SCHOOL_STATUS_ENABLED, label: SCHOOL_STATUS_ENABLED_LABEL },
    { value: SCHOOL_STATUS_DISABLED, label: SCHOOL_STATUS_DISABLED_LABEL },
  ],
  getLabel(code: number | string | null | undefined) {
    if (code == null || code === '') return '—';
    return this.labelMap[Number(code)] || String(code);
  },
  getTagType(code: number | string | null | undefined) {
    return this.tagMap[Number(code)] || 'info';
  },
};

export default schoolStatus;
