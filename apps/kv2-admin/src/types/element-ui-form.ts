/** Element UI 表单类型占位（替代 element-plus 类型导入） */
export type FormInstance = {
  validate: (cb?: (valid: boolean) => void) => Promise<boolean> | void;
  validateField: (prop: string | string[], cb?: (error?: string) => void) => void;
  resetFields: () => void;
  clearValidate: (props?: string | string[]) => void;
};

export type FormRules = Record<string, unknown | unknown[]>;

export type SelectInstance = {
  blur: () => void;
  focus: () => void;
};
