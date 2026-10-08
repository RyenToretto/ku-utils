import type { AbstractControl, ValidationErrors } from '@angular/forms';

/** 必填且不能全是空白（对齐 antd rules `{ required, whitespace }` / el-form trim 校验） */
export function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value == null) return { required: true };
  if (typeof value === 'string' && value.trim() === '') return { required: true };
  return null;
}
