/** Element UI 表单类型（Element UI 未导出校验规则类型，按 async-validator 约定声明） */
export type FormInstance = {
  validate: (cb?: (valid: boolean) => void) => Promise<boolean> | void;
  validateField: (prop: string | string[], cb?: (error?: string) => void) => void;
  resetFields: () => void;
  clearValidate: (props?: string | string[]) => void;
};

export type FormItemValidator = (
  rule: unknown,
  value: unknown,
  callback: (error?: Error) => void,
) => void;

export type FormItemRule = {
  required?: boolean;
  message?: string;
  trigger?: 'blur' | 'change' | Array<'blur' | 'change'>;
  validator?: FormItemValidator;
  [key: string]: unknown;
};

export type FormRules = Record<string, FormItemRule | FormItemRule[]>;

export type SelectInstance = {
  blur: () => void;
  focus: () => void;
};
