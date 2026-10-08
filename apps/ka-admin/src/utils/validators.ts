import type { AbstractControl, ValidationErrors } from '@angular/forms';

/** 必填且不能全是空白（对齐 antd rules `{ required, whitespace }` / el-form trim 校验） */
export function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value == null) return { required: true };
  if (typeof value === 'string' && value.trim() === '') return { required: true };
  return null;
}

/** 选择器必选：单选非空，多选至少一项（对齐 antd rules `{ type: 'array', required, min: 1 }`） */
export function requiredPick(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (Array.isArray(value) ? value.length : value) return null;
  return { required: true };
}
