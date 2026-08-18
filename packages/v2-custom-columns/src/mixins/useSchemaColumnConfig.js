/**
 * @file useSchemaColumnConfig.js
 * @description schema + v-for 驱动的列配置 Mixin（Vue 2）
 *
 * 核心思路：
 * - 消费方在组件 data() 中提供 columnSchemas（可配置列的描述数组）
 * - Mixin 计算 visibleSchemas（当前应渲染的列列表），模板通过 v-for 渲染
 * - 刷新时只 mount 配置中的列，从根本上满足"按配置直接渲染"强需求
 * - 兼容 DoTableHeader / DoConfigColumnDialog 通过 provide/inject crud 读取的接口
 *
 * 消费方必须提供：
 *   data() {
 *     return {
 *       columnSchemas: [...],     // 可配置列的 schema 数组
 *       schemaStorageKey: 'xxx',  // 可选，覆盖默认 storage key
 *       schemaVersion: 1,         // 可选，schema 版本号（字段增删时递增，旧缓存自动废弃）
 *     }
 *   }
 *
 * 可选 hook（在 data() 中声明）：
 *   data() {
 *     return {
 *       // 弹窗关闭时执行的回调（取消/点 X 时触发，确认时不触发）
 *       onDialogClose: () => { ... }
 *     }
 *   }
 *
 * 版本兼容策略：
 *   localStorage key 包含 schemaVersion。版本递增后旧缓存键不同，自动以默认配置初始化。
 *   无需手动清理旧数据（旧 key 自然失效）。
 */

import { transferTF } from '@ku-utils/utils';

export default {
  provide() {
    return {
      crud: this,
    };
  },

  data() {
    const defaultConfigLabel = '默认配置';
    return {
      /**
       * schemaVersion: schema 结构版本号
       * 当 columnSchemas 发生不兼容变更（字段重命名/删除）时，递增此值
       * 旧版本 localStorage 缓存将自动失效，以默认配置初始化
       */
      schemaVersion: 1,

      /**
       * schemaStorageKey: localStorage 基础 key，消费方按需覆盖
       * 最终 key = `${schemaStorageKey}_${routePath}_v${schemaVersion}`
       */
      schemaStorageKey: 'schema_col_config',

      defaultConfigLabel,
      noNameLabel: '未命名配置',
      maxConfigCount: 10,
      /**
       * maxSelectCount: 已选列数量上限
       * 消费方可在 data() 中覆盖，如 maxSelectCount: 30
       * DoConfigColumnDialog 通过 inject crud 读取，显示「已添加 N/M」提示
       */
      maxSelectCount: 50,
      /**
       * alwaysVisibleColumns: 硬编码固定列声明
       * 这些列写在模板 v-for 之外，不受 columnSchemas / visibleSchemas 控制。
       * 填写后，弹窗右侧固定区会将它们置顶展示（🔒 图标 + 灰底），让用户有感知。
       * 不计入「已添加 N/M」计数，也不出现在 confirm 事件 emit 的 columns 中。
       */
      alwaysVisibleColumns: [],
      systemConfigLabel: [defaultConfigLabel],

      tableStorage: {
        activeColumnConfigLabel: defaultConfigLabel,
        columnConfig: [{ label: defaultConfigLabel, columns: [] }],
      },

      /**
       * onDialogClose: 弹窗关闭回调（取消/点 X 时触发）
       * 消费方可在 data() 中覆盖，执行项目特定逻辑（如 Vuex dispatch）
       * 默认为 null（不执行任何操作）
       */
      onDialogClose: null,
    };
  },

  computed: {
    _schemaOriginStorageKey() {
      const pathStr = transferTF(this.$route.fullPath.replace(new RegExp('/', 'gm'), '_'));
      const version = (this.$VERSION_INFO && this.$VERSION_INFO.version) || '';
      return `${this.schemaStorageKey}_${pathStr.split('?')[0]}_${version}_sv${this.schemaVersion}`;
    },

    /**
     * tableColumns: 所有可配置列的状态列表
     * 与 tableControl 的 tableColumns 接口兼容，供 DoTableHeader / DoConfigColumnDialog 消费
     */
    tableColumns() {
      const schemas = this._getConfigurableSchemas();
      const activeConfig = this._getActiveConfig();

      return schemas.map((schema) => ({
        property: schema.prop,
        label: schema.label,
        fixed: !!schema.fixed,
        group: schema.group || '未分组',
        isLeaf: true,
        visible: this._isSchemaVisible(schema.prop, activeConfig),
      }));
    },

    /**
     * tableRenderKey: el-table 的 :key 绑定值
     * 当可见列的顺序或组成发生变化时，key 发生变化，强制 el-table 整体重建，
     * 避免 Vue 2 复用 el-table-column 组件导致 el-table 内部列顺序不更新的问题。
     * 消费方在 el-table 上加 :key="tableRenderKey" 即可。
     */
    tableRenderKey() {
      const getLeafProps = (schemas) => {
        const leaves = [];
        (schemas || []).forEach((s) => {
          if (s.children && s.children.length) {
            leaves.push(...getLeafProps(s.children));
          } else if (s.prop) {
            leaves.push(s.prop);
          }
        });
        return leaves;
      };
      return getLeafProps(this.visibleSchemas || []).join(',');
    },

    /**
     * visibleSchemas: 当前应渲染的列 schema 树
     * 模板通过 v-for 渲染此数组，从根本上满足"按配置直接渲染"强需求
     *
     * 扁平列：返回可见叶子数组（保持顺序兼容）。
     * 嵌套列：返回经可见性裁剪的树（父节点至少有一个可见子节点才保留）。
     *
     * 顺序说明：
     *   - 有用户配置时（扁平叶子场景）：按 activeConfig.columns 顺序输出叶子。
     *   - 嵌套场景 / 无配置时：按 columnSchemas 原始树形顺序输出（不重排）。
     */
    visibleSchemas() {
      const schemas = this.columnSchemas || [];
      const activeConfig = this._getActiveConfig();
      const allLeaves = this._getConfigurableSchemas();
      const hasNesting = schemas.some((s) => s.children && s.children.length);

      const isFullVisible =
        !activeConfig ||
        !activeConfig.columns ||
        !activeConfig.columns.length ||
        activeConfig.columns.includes('ALL');

      if (hasNesting) {
        const activeCols = isFullVisible ? null : activeConfig.columns;
        return this._pruneVisibleTree(
          schemas.filter((s) => !s.alwaysVisible),
          activeCols,
        );
      }

      if (isFullVisible) return allLeaves;

      const propSet = new Set(allLeaves.map((s) => s.prop));
      const schemaMap = new Map(allLeaves.map((s) => [s.prop, s]));
      return activeConfig.columns
        .filter((prop) => propSet.has(prop))
        .map((prop) => schemaMap.get(prop))
        .filter(Boolean);
    },
  },

  created() {
    this._initSchemaStorage();
  },

  methods: {
    /**
     * 递归将嵌套 schema 树展平为叶子节点数组
     * @private
     */
    _flattenLeafSchemas(schemas) {
      if (!schemas || !Array.isArray(schemas)) return [];
      return schemas.reduce((acc, schema) => {
        if (schema.children && schema.children.length) {
          return acc.concat(this._flattenLeafSchemas(schema.children));
        }
        acc.push(schema);
        return acc;
      }, []);
    },

    /**
     * 对 schema 树做可见性裁剪，返回剪枝后的树
     * @private
     */
    _pruneVisibleTree(schemas, activeCols) {
      if (!schemas || !Array.isArray(schemas)) return [];
      const result = schemas.reduce((acc, schema) => {
        if (schema.alwaysVisible) return acc;

        if (schema.children && schema.children.length) {
          const visibleChildren = this._pruneVisibleTree(schema.children, activeCols);
          if (visibleChildren.length > 0) {
            acc.push({ ...schema, children: visibleChildren });
          }
        } else {
          const isVisible = !activeCols || activeCols.includes(schema.prop);
          if (isVisible) acc.push(schema);
        }
        return acc;
      }, []);

      if (activeCols && activeCols.length) {
        const getFirstOrder = (node) => {
          if (!node.children || !node.children.length) {
            const idx = activeCols.indexOf(node.prop);
            return idx >= 0 ? idx : Infinity;
          }
          let min = Infinity;
          const walk = (children) => {
            children.forEach((child) => {
              if (child.children && child.children.length) {
                walk(child.children);
              } else {
                const idx = activeCols.indexOf(child.prop);
                if (idx >= 0 && idx < min) min = idx;
              }
            });
          };
          walk(node.children);
          return min;
        };
        result.sort((a, b) => getFirstOrder(a) - getFirstOrder(b));
      }

      return result;
    },

    /**
     * 获取所有可配置叶子列
     * @private
     */
    _getConfigurableSchemas() {
      const schemas = this.columnSchemas;
      if (!schemas || !Array.isArray(schemas)) {
        console.warn(
          '[useSchemaColumnConfig] columnSchemas 未定义，请在组件 data() 中提供 columnSchemas',
        );
        return [];
      }
      return this._flattenLeafSchemas(schemas).filter((s) => !s.alwaysVisible);
    },

    /**
     * 获取当前激活的列配置
     * @private
     */
    _getActiveConfig() {
      const label = this.tableStorage.activeColumnConfigLabel;
      return this.tableStorage.columnConfig.find((c) => c.label === label) || null;
    },

    /**
     * 判断某个 prop 在当前配置中是否可见
     * @private
     */
    _isSchemaVisible(prop, activeConfig) {
      if (!activeConfig || !activeConfig.columns || !activeConfig.columns.length) return true;
      if (activeConfig.columns.includes('ALL')) return true;
      return activeConfig.columns.includes(prop);
    },

    /**
     * 初始化 schema 配置（从 localStorage 读取或写入默认值）
     * @private
     */
    _initSchemaStorage() {
      const cached = this._readCacheConfig();
      if (!cached) {
        const all = this._getConfigurableSchemas();
        const defaultCols = all.filter((s) => s.isDefault);
        this.tableStorage.columnConfig[0].columns = (defaultCols.length ? defaultCols : all).map(
          (s) => s.prop,
        );
        this._writeCacheConfig();
        return;
      }

      const { activeColumnConfigLabel, columnConfig } = cached;
      this.tableStorage.activeColumnConfigLabel =
        activeColumnConfigLabel || this.defaultConfigLabel;

      if (columnConfig && Array.isArray(columnConfig)) {
        columnConfig.forEach((each) => {
          if (!each) return;
          const isSystem = this.systemConfigLabel.includes(each.label);
          if (isSystem) {
            const existing = this.tableStorage.columnConfig.find((c) => c.label === each.label);
            if (existing && Array.isArray(each.columns)) {
              existing.columns = [...each.columns];
            }
          } else {
            this.tableStorage.columnConfig.push({
              label: each.label,
              columns: Array.isArray(each.columns) ? [...each.columns] : [],
            });
          }
        });
      }
    },

    _readCacheConfig() {
      try {
        const data = window.localStorage.getItem(this._schemaOriginStorageKey);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    },

    _writeCacheConfig(config = null) {
      try {
        const value = config || this.tableStorage;
        if (!value || !value.columnConfig) return;
        window.localStorage.setItem(this._schemaOriginStorageKey, JSON.stringify(value));
      } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          console.error('[useSchemaColumnConfig] localStorage 存储空间不足');
        } else {
          console.warn('[useSchemaColumnConfig] _writeCacheConfig error:', e);
        }
      }
    },

    /**
     * 公共接口：读取缓存配置
     */
    readCacheConfig() {
      const raw = this._readCacheConfig();
      if (!raw) return null;
      const allProps = this._getConfigurableSchemas().map((s) => s.prop);
      if (raw.columnConfig) {
        raw.columnConfig = raw.columnConfig.map((config) => {
          if (
            config.label === this.defaultConfigLabel &&
            (!config.columns || config.columns.length === 0)
          ) {
            return { ...config, columns: allProps };
          }
          return config;
        });
      }
      return raw;
    },

    /**
     * 公共接口：获取默认配置对象
     */
    getDefaultConfig() {
      const idx = this.tableStorage.columnConfig.findIndex(
        (item) => item.label === this.defaultConfigLabel,
      );
      if (idx < 0) return null;
      const config = this.tableStorage.columnConfig[idx];
      if (!config.columns || config.columns.length === 0) {
        return {
          ...config,
          columns: this._getConfigurableSchemas().map((s) => s.prop),
        };
      }
      return config;
    },

    existAlreadyWithSystem(label) {
      return this.systemConfigLabel.includes(label);
    },

    saveConfigToLocal(newConfigName, columns) {
      const cacheColumnConfig = this._readCacheConfig();
      if (!cacheColumnConfig || !cacheColumnConfig.columnConfig) return;

      this._cleanupExcessConfigs(cacheColumnConfig);
      cacheColumnConfig.columnConfig.push({ label: newConfigName, columns });
      this._writeCacheConfig(cacheColumnConfig);

      if (!this.tableStorage.columnConfig.find((c) => c.label === newConfigName)) {
        this.tableStorage.columnConfig.push({ label: newConfigName, columns });
      }
    },

    _cleanupExcessConfigs(cacheColumnConfig) {
      if (!cacheColumnConfig || !cacheColumnConfig.columnConfig) return;

      const userConfigs = cacheColumnConfig.columnConfig.filter(
        (c) => !this.existAlreadyWithSystem(c.label),
      );
      if (userConfigs.length >= this.maxConfigCount) {
        const oldest = userConfigs[0];
        const idx = cacheColumnConfig.columnConfig.findIndex((c) => c.label === oldest.label);
        if (idx >= 0) cacheColumnConfig.columnConfig.splice(idx, 1);
      }
    },

    removeConfigFromLocal(label) {
      const cacheColumnConfig = this._readCacheConfig();
      if (!cacheColumnConfig || !cacheColumnConfig.columnConfig) return;
      const idx = cacheColumnConfig.columnConfig.findIndex((item) => item.label === label);
      if (idx < 0) return;
      cacheColumnConfig.columnConfig.splice(idx, 1);

      // 若删除的是当前激活配置，回退到默认配置
      if (cacheColumnConfig.activeColumnConfigLabel === label) {
        cacheColumnConfig.activeColumnConfigLabel = this.defaultConfigLabel;
      }
      this._writeCacheConfig(cacheColumnConfig);

      const localIdx = this.tableStorage.columnConfig.findIndex((c) => c.label === label);
      if (localIdx >= 0) this.tableStorage.columnConfig.splice(localIdx, 1);

      if (this.tableStorage.activeColumnConfigLabel === label) {
        const fallback =
          this.tableStorage.columnConfig.find((c) => c.label === this.defaultConfigLabel) ||
          this.tableStorage.columnConfig[0] ||
          null;
        if (fallback) {
          this.applyColumnConfig(fallback);
        }
      }
    },

    /**
     * 更新已有配置（rename 或仅更新 columns）
     * @param {string} oldLabel - 原配置名
     * @param {string} newLabel - 新配置名（与 oldLabel 相同则仅更新 columns）
     * @param {string[]} columns - 新的列 prop 数组
     */
    updateConfigInLocal(oldLabel, newLabel, columns) {
      const cacheColumnConfig = this._readCacheConfig();
      if (!cacheColumnConfig || !cacheColumnConfig.columnConfig) return;

      const idx = cacheColumnConfig.columnConfig.findIndex((item) => item.label === oldLabel);
      if (idx < 0) return;

      cacheColumnConfig.columnConfig[idx] = { label: newLabel, columns: [...columns] };

      // 若激活的是被修改的配置，同步更新 activeLabel
      if (cacheColumnConfig.activeColumnConfigLabel === oldLabel) {
        cacheColumnConfig.activeColumnConfigLabel = newLabel;
      }
      this._writeCacheConfig(cacheColumnConfig);

      // 同步内存 state
      const localIdx = this.tableStorage.columnConfig.findIndex((c) => c.label === oldLabel);
      if (localIdx >= 0) {
        this.tableStorage.columnConfig.splice(localIdx, 1, {
          label: newLabel,
          columns: [...columns],
        });
      }
      if (this.tableStorage.activeColumnConfigLabel === oldLabel) {
        this.tableStorage.activeColumnConfigLabel = newLabel;
      }
    },

    /**
     * 应用列配置
     */
    applyColumnConfig(config) {
      if (!config || !config.label) return;

      const schemas = this._getConfigurableSchemas();
      const allProps = schemas.map((s) => s.prop);

      const columns =
        !config.columns || !config.columns.length || config.columns.includes('ALL')
          ? allProps
          : config.columns;

      const { label } = config;

      const existIdx = this.tableStorage.columnConfig.findIndex((c) => c.label === label);
      if (existIdx === -1) {
        this.tableStorage.columnConfig.push({ label, columns: [...columns] });
      } else {
        const existing = this.tableStorage.columnConfig[existIdx];
        this.tableStorage.columnConfig.splice(existIdx, 1, { ...existing, columns: [...columns] });
      }
      this.tableStorage.activeColumnConfigLabel = label;
      this.dealLabelChange(label);

      const cacheColumnConfig = this._readCacheConfig() || {
        activeColumnConfigLabel: label,
        columnConfig: [],
      };
      cacheColumnConfig.activeColumnConfigLabel = label;
      const cacheIdx = cacheColumnConfig.columnConfig.findIndex((c) => c.label === label);
      if (cacheIdx === -1) {
        cacheColumnConfig.columnConfig.push({ label, columns: [...columns] });
      } else {
        cacheColumnConfig.columnConfig[cacheIdx].columns = [...columns];
      }
      this._writeCacheConfig(cacheColumnConfig);
    },

    applyColumnByLabel(labels) {
      const labelName = labels && labels.length === 1 ? labels[0] : this.defaultConfigLabel;
      const cfg = this.tableStorage.columnConfig.find((c) => c.label === labelName);
      if (cfg) {
        this.applyColumnConfig(cfg);
      }
    },

    dealLabelChange(label) {
      if (this.activeLabelChange) {
        this.activeLabelChange(label);
      } else {
        this.$emit('label-change', label);
      }
    },

    /**
     * 格式化 schema 列的单元格值（替代模板中 filter 调用）
     */
    formatSchemaCell(val, schema) {
      if (val === null || val === undefined || val === '') return '-';

      const filters = this.$options.filters || {};

      const applyFilter = (filterFn, ...args) => {
        if (typeof filterFn !== 'function') return val;
        const result = filterFn(val, ...args);
        return result === null || result === undefined || result === '' ? '-' : result;
      };

      switch (schema.renderType) {
        case 'float':
        case 'roi-link': {
          const [digits = 2, noZero = true] = schema.renderArgs || [];
          return applyFilter(filters.float, digits, noZero);
        }
        case 'percent': {
          const [digits = 1, noZero = true] = schema.renderArgs || [];
          return applyFilter(filters.percent, digits, noZero);
        }
        case 'integer':
          return applyFilter(filters.integer);
        default:
          return val === '' ? '-' : val;
      }
    },

    /**
     * 自动检测硬编码固定列（在弹窗打开时由 DoConfigColumnDialog 调用）
     */
    _detectHardcodedCols() {
      const findElTable = (vm) => {
        if (!vm) return null;
        if (vm.$options && vm.$options.name === 'ElTable') return vm;
        for (const child of vm.$children || []) {
          const found = findElTable(child);
          if (found) return found;
        }
        return null;
      };

      const elTable = findElTable(this);
      if (!elTable) return [];

      const collectLeafProps = (list) => {
        const props = new Set();
        const walk = (schemas) => {
          (schemas || []).forEach((s) => {
            if (s.children && s.children.length) {
              walk(s.children);
            } else if (s.prop) {
              props.add(s.prop);
            }
          });
        };
        walk(list);
        return props;
      };

      const schemaProps = collectLeafProps(this.columnSchemas || []);

      const allCols = elTable.store?.states?._columns || [];

      return allCols
        .filter((col) => col.property && !schemaProps.has(col.property))
        .map((col) => ({ prop: col.property, label: col.label || col.property }));
    },
  },
};
