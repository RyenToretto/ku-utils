export const EXAMPLE_TASK_CREATE = 'create';
export const EXAMPLE_TASK_CREATE_LABEL = '新建';
export const EXAMPLE_TASK_UPDATE = 'update';
export const EXAMPLE_TASK_UPDATE_LABEL = '变更';
export const EXAMPLE_TASK_DELETE = 'delete';
export const EXAMPLE_TASK_DELETE_LABEL = '删除';

const exampleTaskAction = {
  EXAMPLE_TASK_CREATE,
  EXAMPLE_TASK_CREATE_LABEL,
  EXAMPLE_TASK_UPDATE,
  EXAMPLE_TASK_UPDATE_LABEL,
  EXAMPLE_TASK_DELETE,
  EXAMPLE_TASK_DELETE_LABEL,
  labelMap: {
    [EXAMPLE_TASK_CREATE]: EXAMPLE_TASK_CREATE_LABEL,
    [EXAMPLE_TASK_UPDATE]: EXAMPLE_TASK_UPDATE_LABEL,
    [EXAMPLE_TASK_DELETE]: EXAMPLE_TASK_DELETE_LABEL,
  } as Record<string, string>,
  options: [
    { value: EXAMPLE_TASK_CREATE, label: EXAMPLE_TASK_CREATE_LABEL },
    { value: EXAMPLE_TASK_UPDATE, label: EXAMPLE_TASK_UPDATE_LABEL },
    { value: EXAMPLE_TASK_DELETE, label: EXAMPLE_TASK_DELETE_LABEL },
  ],
  getLabel(code: string | null | undefined) {
    if (code == null || code === '') return '—';
    return this.labelMap[code] || String(code);
  },
};

export default exampleTaskAction;
