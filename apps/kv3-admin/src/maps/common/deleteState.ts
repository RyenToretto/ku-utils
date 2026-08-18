export const DELETE_STATE_NORMAL = 0;
export const DELETE_STATE_NORMAL_LABEL = '正常';
export const DELETE_STATE_DELETED = 1;
export const DELETE_STATE_DELETED_LABEL = '已删除';

const deleteState = {
  DELETE_STATE_NORMAL,
  DELETE_STATE_NORMAL_LABEL,
  DELETE_STATE_DELETED,
  DELETE_STATE_DELETED_LABEL,
  labelMap: {
    [DELETE_STATE_NORMAL]: DELETE_STATE_NORMAL_LABEL,
    [DELETE_STATE_DELETED]: DELETE_STATE_DELETED_LABEL,
  } as Record<number, string>,
  options: [
    { value: DELETE_STATE_NORMAL, label: DELETE_STATE_NORMAL_LABEL },
    { value: DELETE_STATE_DELETED, label: DELETE_STATE_DELETED_LABEL },
  ],
  getLabel(code: number | string | null | undefined) {
    if (code == null || code === '') return '—';
    return this.labelMap[Number(code)] || String(code);
  },
};

export default deleteState;
