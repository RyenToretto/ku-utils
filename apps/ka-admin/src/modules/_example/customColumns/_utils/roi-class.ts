/** ROI ≥ 1.8 高亮（03 / 06 内联单元格模板共用） */
export function roiClass(row: Record<string, unknown>) {
  return Number(row['roi']) >= 1.8 ? 'roi-high' : 'roi-normal';
}
