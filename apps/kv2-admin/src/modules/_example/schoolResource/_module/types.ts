import type { SchoolResourceRow } from '../_api';

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
