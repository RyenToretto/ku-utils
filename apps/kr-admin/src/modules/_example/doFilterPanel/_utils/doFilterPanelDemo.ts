/** DoFilterPanel Demo：筛选项数量 → 约等于期望视觉行数（栅格自适应，以项数近似） */
export type DoFilterPanelDemoScenario = {
  buttonCount: 1 | 2 | 3 | 4;
  /** 筛选项个数 */
  filterCount: number;
  /** 折叠时可见行数 */
  line: number;
  /**
   * 复现「height:100% + 列 flex + 区内滚动」页。
   * 展开筛选时若 table-wrap 可被 flex 压缩，会出现表格被压扁。
   */
  fillViewportLayout?: boolean;
};

export type DoFilterPanelDemoField = {
  key: string;
  kind: 'input' | 'select' | 'radio';
};

/** 生成稳定硬编码形态的筛选项描述（非表格行种子，允许按数量工厂） */
export function buildDoFilterPanelDemoFields(count: number): DoFilterPanelDemoField[] {
  const fields: DoFilterPanelDemoField[] = [];
  const kinds: Array<DoFilterPanelDemoField['kind']> = ['input', 'select', 'radio'];
  for (let i = 0; i < count; i += 1) {
    fields.push({
      key: `f${i + 1}`,
      kind: kinds[i % kinds.length]!,
    });
  }
  return fields;
}

export function createDoFilterPanelDemoFilters(count: number): Record<string, string> {
  const filters: Record<string, string> = {};
  for (let i = 0; i < count; i += 1) {
    filters[`f${i + 1}`] = '';
  }
  return filters;
}
