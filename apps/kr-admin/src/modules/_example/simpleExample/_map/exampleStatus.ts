export const EXAMPLE_STATUS_ENABLED = 1;
export const EXAMPLE_STATUS_ENABLED_LABEL = '启用';
export const EXAMPLE_STATUS_DISABLED = 0;
export const EXAMPLE_STATUS_DISABLED_LABEL = '停用';

const exampleStatus = {
  EXAMPLE_STATUS_ENABLED,
  EXAMPLE_STATUS_ENABLED_LABEL,
  EXAMPLE_STATUS_DISABLED,
  EXAMPLE_STATUS_DISABLED_LABEL,
  labelMap: {
    [EXAMPLE_STATUS_ENABLED]: EXAMPLE_STATUS_ENABLED_LABEL,
    [EXAMPLE_STATUS_DISABLED]: EXAMPLE_STATUS_DISABLED_LABEL,
  } as Record<number, string>,
  tagMap: {
    [EXAMPLE_STATUS_ENABLED]: 'success',
    [EXAMPLE_STATUS_DISABLED]: 'info',
  } as Record<number, string>,
  options: [
    { value: EXAMPLE_STATUS_ENABLED, label: EXAMPLE_STATUS_ENABLED_LABEL },
    { value: EXAMPLE_STATUS_DISABLED, label: EXAMPLE_STATUS_DISABLED_LABEL },
  ],
  getLabel(code: number | string | null | undefined) {
    if (code == null || code === '') return '—';
    return this.labelMap[Number(code)] || String(code);
  },
  getTagType(code: number | string | null | undefined) {
    return this.tagMap[Number(code)] || 'info';
  },
};

export default exampleStatus;
