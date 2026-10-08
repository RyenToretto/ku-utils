import type { SchoolResourceRow } from '../_api';
import { SCHOOL_STATUS_ENABLED } from '../_map/school-status';

/** 选择器对外值：id = school id */
export type SchoolSelectorValue = {
  id: string;
  label: string;
  item: SchoolResourceRow;
};

export type SchoolSelectorChange = SchoolSelectorValue | SchoolSelectorValue[];

export function schoolPickLabel(row: Pick<SchoolResourceRow, 'id' | 'schoolName'>) {
  const name = row.schoolName || '';
  if (name) return `${name}（${row.id}）`;
  return String(row.id);
}

export function toSchoolPick(row: SchoolResourceRow): SchoolSelectorValue {
  return {
    id: String(row.id),
    label: schoolPickLabel(row),
    item: row,
  };
}

/** 业务行只存 id + 名称时，构造可回显的选择项 */
export function toSchoolPickFromRef(ref: {
  id: string | number;
  schoolName?: string | null;
}): SchoolSelectorValue {
  return toSchoolPick({
    id: String(ref.id),
    schoolName: ref.schoolName || '',
    status: SCHOOL_STATUS_ENABLED,
    remark: '',
    createTime: '',
  });
}
