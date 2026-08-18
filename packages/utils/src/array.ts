type AnyObj = Record<string, unknown>;

/**
 * ID 列表对齐合并
 *
 * 以 newList 为新基准，从 originList 中按 fieldAttr 找已有对象保留，
 * 否则用 { [fieldAttr]: newItem } 占位。可选追加被删除项（带 isDelete 标记）。
 *
 * @example
 *   cherrySetId('pkg', ['a','b'], [{ id: 1, pkg: 'a' }])
 *   // [{ id: 1, pkg: 'a' }, { pkg: 'b' }]
 */
export function cherrySetId<T extends AnyObj>(
  fieldAttr: string,
  newList: unknown[],
  originList: T[],
  withDeleted = false,
): Array<T | AnyObj> {
  if (!newList || !Array.isArray(newList)) return [];
  if (!originList || !Array.isArray(originList)) {
    return newList.map((item) => ({ [fieldAttr]: item }));
  }

  const result: Array<T | AnyObj> = [];
  newList.forEach((newItem) => {
    const existing = originList.find((o) => o[fieldAttr] === newItem);
    if (existing) {
      result.push(existing);
    } else {
      result.push({ [fieldAttr]: newItem });
    }
  });

  if (withDeleted) {
    originList.forEach((originItem) => {
      if (!newList.includes(originItem[fieldAttr])) {
        result.push({ ...originItem, isDelete: true });
      }
    });
  }
  return result;
}
