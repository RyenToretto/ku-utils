export const CLUB_STATUS_ENABLED = 1;
export const CLUB_STATUS_ENABLED_LABEL = '启用';
export const CLUB_STATUS_DISABLED = 0;
export const CLUB_STATUS_DISABLED_LABEL = '停用';

const clubStatus = {
  CLUB_STATUS_ENABLED,
  CLUB_STATUS_ENABLED_LABEL,
  CLUB_STATUS_DISABLED,
  CLUB_STATUS_DISABLED_LABEL,
  labelMap: {
    [CLUB_STATUS_ENABLED]: CLUB_STATUS_ENABLED_LABEL,
    [CLUB_STATUS_DISABLED]: CLUB_STATUS_DISABLED_LABEL,
  } as Record<number, string>,
  tagMap: {
    [CLUB_STATUS_ENABLED]: 'success',
    [CLUB_STATUS_DISABLED]: 'info',
  } as Record<number, string>,
  options: [
    { value: CLUB_STATUS_ENABLED, label: CLUB_STATUS_ENABLED_LABEL },
    { value: CLUB_STATUS_DISABLED, label: CLUB_STATUS_DISABLED_LABEL },
  ],
  getLabel(code: number | string | null | undefined) {
    if (code == null || code === '') return '—';
    return this.labelMap[Number(code)] || String(code);
  },
  getTagType(code: number | string | null | undefined) {
    return this.tagMap[Number(code)] || 'info';
  },
};

export default clubStatus;
