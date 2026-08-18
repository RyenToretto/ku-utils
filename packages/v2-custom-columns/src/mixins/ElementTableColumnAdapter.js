/**
 * @file ElementTableColumnAdapter.js
 * @description Element UI Table 内部 store 访问的统一 Adapter
 *
 * 职责边界：
 * - 收敛 Element UI Table 内部 store 的所有访问点（_columns / columns / insertColumn / removeColumn）
 * - 防御 removeColumn 在 indexOf(column) === -1 时 splice(-1,1) 误删最后一列的 Element UI bug
 * - 提供 tableRef 和实例合法性的统一校验
 * - 不负责业务列 schema、弹窗 UI、配置持久化、服务端同步
 *
 * 使用方：tableControl.js（过渡治理层）
 * 目标：后续 schema + v-for 方案不再需要本 Adapter
 */

/**
 * 检查传入值是否是合法的 Element UI Table 实例
 * @param {*} table
 * @returns {boolean}
 */
function isValidTableInstance(table) {
  return !!(
    table &&
    typeof table === 'object' &&
    table.store &&
    table.store.states &&
    typeof table.store.commit === 'function'
  );
}

const ElementTableColumnAdapter = {
  /**
   * 从 Vue 组件实例解析并校验 Element UI Table 实例
   *
   * @param {Vue} instance - Vue 组件实例（含 $refs）
   * @param {string} tableRef - ref 名称
   * @returns {Object|null} Element UI Table 实例；校验失败时返回 null 并输出 warn
   */
  resolveTable(instance, tableRef) {
    if (!tableRef) {
      console.warn('[ElementTableColumnAdapter] tableRef 未配置，请在组件 data() 中设置 tableRef');
      return null;
    }

    if (!instance || !instance.$refs) {
      console.warn('[ElementTableColumnAdapter] instance 无效，无法访问 $refs');
      return null;
    }

    const table = instance.$refs[tableRef];

    if (table === undefined) {
      console.warn(
        `[ElementTableColumnAdapter] $refs["${tableRef}"] 不存在，请确认 ref 名称是否与模板一致`,
      );
      return null;
    }

    if (!isValidTableInstance(table)) {
      console.warn(
        `[ElementTableColumnAdapter] $refs["${tableRef}"] 不是有效的 Element UI Table 实例（缺少 store 或 store.states）`,
      );
      return null;
    }

    return table;
  },

  /**
   * 获取 Element UI Table 内部 store.states
   *
   * 此为 Element UI 内部 API 访问唯一入口，必须通过本 Adapter 访问，不得在外部直接使用 table.store.states。
   *
   * @param {Object} table - Element UI Table 实例
   * @returns {Object|null}
   */
  getStoreStates(table) {
    if (!isValidTableInstance(table)) return null;
    return table.store.states;
  },

  /**
   * 获取列注册树（原始嵌套列数组）
   *
   * 对应 Element UI 内部 states._columns
   *
   * @param {Object} table
   * @returns {Array}
   */
  getColumnTree(table) {
    const states = this.getStoreStates(table);
    if (!states) return [];
    return states._columns || [];
  },

  /**
   * 获取当前可见的叶子列数组
   *
   * 对应 Element UI 内部 states.columns（由 updateColumns() 从 _columns 派生）
   *
   * @param {Object} table
   * @returns {Array}
   */
  getVisibleLeafColumns(table) {
    const states = this.getStoreStates(table);
    if (!states) return [];
    return states.columns || [];
  },

  /**
   * 递归扁平化列树，提取所有叶子列
   *
   * 非叶子列（含 children）仅作为路径和分组信息，不输出为可配置列。
   * 不修改原始列对象。
   *
   * @param {Array} columns - 列树
   * @param {Object|null} parent - 父列对象引用
   * @param {string} group - 当前分组名称
   * @param {number[]} path - 当前路径（从根到当前节点的索引数组）
   * @returns {Array<{property, label, column, parent, group, path, depth, fixed}>}
   */
  flattenColumnTree(columns, parent = null, group = '未分组', path = []) {
    if (!columns || !Array.isArray(columns)) return [];

    const result = [];

    columns.forEach((col, index) => {
      if (!col) return;

      const currentPath = [...path, index];
      const currentGroup = parent ? parent.label || group : group;

      if (col.children && Array.isArray(col.children) && col.children.length > 0) {
        // 非叶子列：递归，分组继承父列 label
        result.push(
          ...this.flattenColumnTree(col.children, col, col.label || currentGroup, currentPath),
        );
      } else {
        // 叶子列
        result.push({
          property: col.property || null,
          label: col.label || '',
          column: col,
          parent,
          group: currentGroup,
          path: currentPath,
          depth: currentPath.length,
          fixed: !!col.fixed,
        });
      }
    });

    return result;
  },

  /**
   * 在列树中按 property 查找列
   *
   * 若存在重复 property，返回 conflicts 数组，由调用方决定如何处理。
   *
   * @param {Array} columns - 列树（states._columns）
   * @param {string} property
   * @param {Object|null} parent
   * @returns {{ found: Object|null, conflicts: Array }}
   *   found: { column, parent } 或 null
   *   conflicts: 所有匹配项的数组（正常情况下只有一项）
   */
  findColumn(columns, property, parent = null) {
    if (!columns || !Array.isArray(columns) || !property) {
      return { found: null, conflicts: [] };
    }

    const matches = [];

    const walk = (cols, parentCol) => {
      cols.forEach((col) => {
        if (!col) return;
        if (col.property === property) {
          matches.push({ column: col, parent: parentCol });
        }
        if (col.children && Array.isArray(col.children) && col.children.length > 0) {
          walk(col.children, col);
        }
      });
    };

    walk(columns, parent);

    if (matches.length > 1) {
      console.warn(
        `[ElementTableColumnAdapter] 发现重复 prop "${property}"（共 ${matches.length} 个），` +
          '请检查模板中是否有重复列声明。返回第一个匹配项。',
      );
    }

    return {
      found: matches.length > 0 ? matches[0] : null,
      conflicts: matches,
    };
  },

  /**
   * 计算列的插入位置
   *
   * @param {Object} columnInfo - 目标列信息（flattenColumnTree 输出的单项）
   * @param {Array} allColumnInfos - 所有叶子列信息数组（同 flattenColumnTree 的完整输出）
   * @param {Object} options
   * @param {boolean} [options.appendToEnd=false] - 插入到父节点末尾（用于按配置顺序逐一插入）
   * @param {Object} [options.table] - Element UI Table 实例（用于读取当前可见列）
   * @returns {number}
   */
  getInsertIndex(columnInfo, allColumnInfos, options = {}) {
    const { appendToEnd = false, table } = options;

    if (appendToEnd) {
      // 插入到同级末尾
      const parent = columnInfo.parent;
      if (parent && Array.isArray(parent.children)) {
        return parent.children.length;
      }
      if (table) {
        const columnTree = this.getColumnTree(table);
        return columnTree.length;
      }
      return 0;
    }

    // 按原始顺序计算插入位置
    // 找到 columnInfo 在 allColumnInfos 中的原始索引
    const originalIndex = allColumnInfos.findIndex((info) => info.column === columnInfo.column);
    if (originalIndex === -1) return 0;

    const parent = columnInfo.parent;

    // 获取目标父节点下的当前列数组
    let targetArray;
    if (parent && Array.isArray(parent.children)) {
      targetArray = parent.children;
    } else if (table) {
      targetArray = this.getColumnTree(table);
    } else {
      return 0;
    }

    // 在 originalIndex 之前，与 columnInfo 同一父节点的列，有多少已在 targetArray 中
    let insertIndex = 0;
    for (let i = 0; i < originalIndex; i++) {
      const info = allColumnInfos[i];
      if (info.parent === parent && targetArray.includes(info.column)) {
        insertIndex++;
      }
    }

    return insertIndex;
  },

  /**
   * 安全插入列
   *
   * @param {Object} table - Element UI Table 实例
   * @param {Object} columnInfo - { column, parent }
   * @param {number} index - 插入位置
   * @returns {boolean} 是否成功插入
   */
  insertColumn(table, columnInfo, index) {
    if (!isValidTableInstance(table)) {
      console.warn('[ElementTableColumnAdapter] insertColumn: table 实例无效');
      return false;
    }

    if (!columnInfo || !columnInfo.column) {
      console.warn('[ElementTableColumnAdapter] insertColumn: columnInfo.column 缺失');
      return false;
    }

    const { column, parent } = columnInfo;

    // 检查是否已经在可见列中（防止重复插入）
    const visibleLeafs = this.getVisibleLeafColumns(table);
    const alreadyVisible = visibleLeafs.some((col) => col === column);
    if (alreadyVisible) {
      return false;
    }

    // 检查父引用是否仍然有效（仅对嵌套列）
    if (parent) {
      const columnTree = this.getColumnTree(table);
      const { found } = this.findColumn(columnTree, parent.property || '', null);
      if (parent.property && !found) {
        console.warn(
          `[ElementTableColumnAdapter] insertColumn: 父列 "${parent.property}" 引用已失效，` +
            '请重建列缓存后再操作',
        );
        return false;
      }
    }

    table.store.commit('insertColumn', column, index, parent || null);
    return true;
  },

  /**
   * 安全移除列
   *
   * 防御 Element UI 原生 removeColumn 在 indexOf(column) === -1 时 splice(-1, 1) 误删最后一列的 Bug。
   *
   * @param {Object} table - Element UI Table 实例
   * @param {Object} columnInfo - { column, parent }
   * @returns {boolean} 是否成功移除
   */
  removeColumn(table, columnInfo) {
    if (!isValidTableInstance(table)) {
      console.warn('[ElementTableColumnAdapter] removeColumn: table 实例无效');
      return false;
    }

    if (!columnInfo || !columnInfo.column) {
      console.warn('[ElementTableColumnAdapter] removeColumn: columnInfo.column 缺失');
      return false;
    }

    const { column, parent } = columnInfo;

    // 关键防御：先确认列确实在目标数组中，再调用 Element UI 原生 removeColumn
    // 避免 indexOf 返回 -1 → splice(-1, 1) 误删最后一列
    const states = this.getStoreStates(table);
    if (!states) return false;

    const targetArray = parent ? parent.children : states._columns;
    if (!Array.isArray(targetArray)) {
      console.warn('[ElementTableColumnAdapter] removeColumn: 目标列数组不存在');
      return false;
    }

    const colIndex = targetArray.indexOf(column);
    if (colIndex === -1) {
      // 列不在目标数组中，跳过，不调用原生 removeColumn
      return false;
    }

    table.store.commit('removeColumn', column, parent || null);
    return true;
  },

  /**
   * 触发表格布局更新
   *
   * @param {Object} table - Element UI Table 实例
   */
  layout(table) {
    if (!isValidTableInstance(table)) return;

    if (typeof table.doLayout === 'function') {
      table.doLayout();
    } else if (table.store && typeof table.store.scheduleLayout === 'function') {
      table.store.scheduleLayout();
    }
  },
};

export default ElementTableColumnAdapter;
