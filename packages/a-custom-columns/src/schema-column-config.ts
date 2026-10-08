import { computed, signal, type Signal } from '@angular/core';
import { formatThousands } from '@ku-utils/utils';

import type {
  AlwaysVisibleColumn,
  ColumnConfig,
  ColumnSchema,
  CustomColumnMessages,
  SchemaColumnConfigOptions,
  SchemaHeaderCell,
  TableColumnMeta,
  TableStorage,
} from './types';

const ALL_FLAG = 'ALL';

export const DEFAULT_CUSTOM_COLUMN_MESSAGES: CustomColumnMessages = {
  customColumns: '自定义列',
  searchPlaceholder: '请搜索指标',
  selectAll: '全选',
  invertSelection: '反选',
  emptySearch: '未找到相关指标',
  selectedCount: (selected, max) => `已添加 (${selected}/${max})`,
  reset: '重置',
  fixedColumnsTip: '以上指标横向固定',
  emptySelected: '暂无已选列',
  configNamePlaceholder: '请输入配置名称',
  cancel: '取消',
  save: '保存',
  saveToLocal: '存到本地',
  readFromLocal: '读取本地',
  complete: '完成',
  customConfig: '自定义配置',
  defaultConfigLabel: '默认配置',
  noNameLabel: '未命名配置',
  groupFallback: '未分组',
  operationColumnLabel: '操作',
  maxSelectedWarning: (max) => `已选列数量已达上限 ${max} 个`,
  configNameRequired: '请输入配置名称',
  configNameExists: '配置名称已存在，请使用其他名称',
  configSaved: '配置已保存',
};

export function flattenLeafSchemas(schemas: ColumnSchema[]): ColumnSchema[] {
  if (!Array.isArray(schemas)) return [];
  return schemas.reduce<ColumnSchema[]>((acc, schema) => {
    if (schema.children && schema.children.length) {
      return acc.concat(flattenLeafSchemas(schema.children));
    }
    acc.push(schema);
    return acc;
  }, []);
}

function getLeafProps(schemas: ColumnSchema[]): string[] {
  return flattenLeafSchemas(schemas)
    .map((s) => s.prop)
    .filter((p): p is string => !!p);
}

function getDepth(schemas: ColumnSchema[]): number {
  return schemas.reduce((max, s) => {
    const d = s.children && s.children.length ? 1 + getDepth(s.children) : 1;
    return Math.max(max, d);
  }, 0);
}

/**
 * 把（可能嵌套的）schema 树展开成多行表头，供 `thead` 逐行渲染；叶子列 rowspan 填满剩余行。
 */
export function buildHeaderRows(schemas: ColumnSchema[]): SchemaHeaderCell[][] {
  const depth = Math.max(getDepth(schemas), 1);
  const rows: SchemaHeaderCell[][] = Array.from({ length: depth }, () => []);
  const walk = (nodes: ColumnSchema[], level: number, path: string) => {
    nodes.forEach((schema, idx) => {
      const key = schema.prop || `${path}${idx}:${schema.label}`;
      if (schema.children && schema.children.length) {
        rows[level].push({
          key,
          schema,
          colspan: flattenLeafSchemas(schema.children).length,
          rowspan: 1,
          isLeaf: false,
        });
        walk(schema.children, level + 1, `${key}/`);
      } else {
        rows[level].push({ key, schema, colspan: 1, rowspan: depth - level, isLeaf: true });
      }
    });
  };
  walk(schemas, 0, '');
  return rows;
}

function pruneVisibleTree(schemas: ColumnSchema[], activeCols: string[] | null): ColumnSchema[] {
  if (!Array.isArray(schemas)) return [];
  const result = schemas.reduce<ColumnSchema[]>((acc, schema) => {
    if (schema.alwaysVisible) return acc;
    if (schema.children && schema.children.length) {
      const visibleChildren = pruneVisibleTree(schema.children, activeCols);
      if (visibleChildren.length > 0) acc.push({ ...schema, children: visibleChildren });
    } else {
      const isVisible = !activeCols || (schema.prop ? activeCols.includes(schema.prop) : false);
      if (isVisible) acc.push(schema);
    }
    return acc;
  }, []);

  if (activeCols && activeCols.length) {
    const getFirstOrder = (node: ColumnSchema): number => {
      const props = getLeafProps([node]);
      const indexes = props.map((p) => activeCols.indexOf(p)).filter((i) => i >= 0);
      return indexes.length ? Math.min(...indexes) : Infinity;
    };
    result.sort((a, b) => getFirstOrder(a) - getFirstOrder(b));
  }

  return result;
}

function resolveStorageKey(storageKey: string, schemaVersion: number): string {
  const pathStr =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\//g, '_') : 'default';
  return `${storageKey}_${pathStr}_sv${schemaVersion}`;
}

function writeStorage(key: string, value: TableStorage): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    const err = e as { name?: string; code?: number };
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.error('[a-custom-columns] localStorage 存储空间不足');
    }
  }
}

/**
 * Angular 自定义列核心状态（schema 驱动，signals）。
 *
 * 通过 `[kuSchemaColumnConfig]` 指令下发给 DoTableHeader（内含配置抽屉）与 ku-schema-cell / ku-schema-header。
 */
export class SchemaColumnConfig {
  readonly messages: CustomColumnMessages;
  readonly maxSelectCount: number;
  readonly maxConfigCount: number;
  readonly defaultConfigLabel: string;
  readonly noNameLabel: string;
  readonly alwaysVisibleColumns: AlwaysVisibleColumn[];
  readonly onDialogClose: (() => void) | null;

  /** 当前可见列 schema（已按配置过滤/排序，保留嵌套结构） */
  readonly visibleSchemas: Signal<ColumnSchema[]>;
  /** 当前可见叶子列（td 逐列渲染用） */
  readonly visibleLeafSchemas: Signal<ColumnSchema[]>;
  /** 当前可见列的多行表头（thead 逐行渲染用） */
  readonly headerRows: Signal<SchemaHeaderCell[][]>;
  /** 抽屉用扁平元数据 */
  readonly tableColumns: Signal<TableColumnMeta[]>;
  /** 可见叶子列 prop 串，列变化时可作为重建依据 */
  readonly tableRenderKey: Signal<string>;
  readonly activeColumnConfigLabel: Signal<string>;
  readonly columnConfig: Signal<ColumnConfig[]>;

  private readonly storage = signal<TableStorage>({
    activeColumnConfigLabel: '',
    columnConfig: [],
  });
  private readonly originStorageKey: string;
  private readonly systemConfigLabel: string[];
  private readonly columnSchemas: ColumnSchema[];
  private readonly onLabelChange: ((label: string) => void) | null;

  constructor(options: SchemaColumnConfigOptions) {
    this.messages = { ...DEFAULT_CUSTOM_COLUMN_MESSAGES, ...(options.messages || {}) };
    this.maxSelectCount = options.maxSelectCount ?? 50;
    this.maxConfigCount = options.maxConfigCount ?? 10;
    this.defaultConfigLabel = options.defaultConfigLabel || this.messages.defaultConfigLabel;
    this.noNameLabel = options.noNameLabel || this.messages.noNameLabel;
    this.alwaysVisibleColumns = options.alwaysVisibleColumns || [];
    this.onDialogClose = options.onDialogClose ?? null;
    this.onLabelChange = options.onLabelChange ?? null;
    this.columnSchemas = options.columnSchemas || [];
    this.systemConfigLabel = [this.defaultConfigLabel];
    this.originStorageKey = resolveStorageKey(
      options.storageKey || 'schema_col_config',
      options.schemaVersion ?? 1,
    );
    this.storage.set(this.createInitialState());

    this.activeColumnConfigLabel = computed(() => this.storage().activeColumnConfigLabel);
    this.columnConfig = computed(() => this.storage().columnConfig);

    this.tableColumns = computed(() => {
      const active = this.activeConfig();
      return this.configurableSchemas().map((schema) => ({
        property: schema.prop,
        label: schema.label,
        fixed: !!schema.fixed,
        group: schema.group || this.messages.groupFallback,
        isLeaf: true,
        visible: this.isSchemaVisible(schema.prop, active),
      }));
    });

    this.visibleSchemas = computed(() => {
      const active = this.activeConfig();
      const allLeaves = this.configurableSchemas();
      const hasNesting = this.columnSchemas.some((s) => s.children && s.children.length);
      const isFullVisible =
        !active || !active.columns || !active.columns.length || active.columns.includes(ALL_FLAG);

      if (hasNesting) {
        return pruneVisibleTree(
          this.columnSchemas.filter((s) => !s.alwaysVisible),
          isFullVisible ? null : active!.columns,
        );
      }
      if (isFullVisible) return allLeaves;

      const schemaMap = new Map(allLeaves.map((s) => [s.prop, s]));
      return active!.columns
        .map((prop) => schemaMap.get(prop))
        .filter((s): s is ColumnSchema => !!s);
    });

    this.visibleLeafSchemas = computed(() => flattenLeafSchemas(this.visibleSchemas()));
    this.headerRows = computed(() => buildHeaderRows(this.visibleSchemas()));
    this.tableRenderKey = computed(() => getLeafProps(this.visibleSchemas()).join(','));
  }

  private activeConfig(): ColumnConfig | null {
    const s = this.storage();
    return s.columnConfig.find((c) => c.label === s.activeColumnConfigLabel) || null;
  }

  private configurableSchemas(): ColumnSchema[] {
    return flattenLeafSchemas(this.columnSchemas).filter((s) => !s.alwaysVisible);
  }

  private allProps(): string[] {
    return this.configurableSchemas()
      .map((s) => s.prop)
      .filter((p): p is string => !!p);
  }

  private isSchemaVisible(prop: string | undefined, active: ColumnConfig | null): boolean {
    if (!active || !active.columns || !active.columns.length) return true;
    if (active.columns.includes(ALL_FLAG)) return true;
    return !!prop && active.columns.includes(prop);
  }

  private createInitialState(): TableStorage {
    const base: TableStorage = {
      activeColumnConfigLabel: this.defaultConfigLabel,
      columnConfig: [{ label: this.defaultConfigLabel, columns: [] }],
    };
    if (typeof window === 'undefined') return base;

    try {
      const raw = window.localStorage.getItem(this.originStorageKey);
      if (!raw) {
        const all = this.configurableSchemas();
        const defaults = all.filter((s) => s.isDefault);
        base.columnConfig[0].columns = (defaults.length ? defaults : all)
          .map((s) => s.prop)
          .filter((p): p is string => !!p);
        writeStorage(this.originStorageKey, base);
        return base;
      }

      const cached = JSON.parse(raw) as TableStorage;
      base.activeColumnConfigLabel = cached.activeColumnConfigLabel || this.defaultConfigLabel;
      if (Array.isArray(cached.columnConfig)) {
        cached.columnConfig.forEach((each) => {
          if (!each) return;
          if (this.systemConfigLabel.includes(each.label)) {
            const existing = base.columnConfig.find((c) => c.label === each.label);
            if (existing && Array.isArray(each.columns)) existing.columns = [...each.columns];
          } else {
            base.columnConfig.push({
              label: each.label,
              columns: Array.isArray(each.columns) ? [...each.columns] : [],
            });
          }
        });
      }
    } catch {
      // 缓存损坏时回落默认配置
    }
    return base;
  }

  private readRawCache(): TableStorage | null {
    try {
      const data = window.localStorage.getItem(this.originStorageKey);
      return data ? (JSON.parse(data) as TableStorage) : null;
    } catch {
      return null;
    }
  }

  /** 读取本地缓存（默认配置空列时补全为全部列） */
  readCacheConfig(): TableStorage | null {
    const raw = this.readRawCache();
    if (!raw) return null;
    const allProps = this.allProps();
    if (raw.columnConfig) {
      raw.columnConfig = raw.columnConfig.map((config) =>
        config.label === this.defaultConfigLabel && (!config.columns || !config.columns.length)
          ? { ...config, columns: allProps }
          : config,
      );
    }
    return raw;
  }

  getDefaultConfig(): ColumnConfig | null {
    const config = this.storage().columnConfig.find((c) => c.label === this.defaultConfigLabel);
    if (!config) return null;
    if (!config.columns || !config.columns.length) {
      return { ...config, columns: this.allProps() };
    }
    return config;
  }

  existAlreadyWithSystem(label: string): boolean {
    return this.systemConfigLabel.includes(label);
  }

  saveConfigToLocal(newConfigName: string, columns: string[]): void {
    const cache = this.readRawCache();
    if (!cache || !cache.columnConfig) return;
    const userConfigs = cache.columnConfig.filter((c) => !this.existAlreadyWithSystem(c.label));
    if (userConfigs.length >= this.maxConfigCount) {
      const idx = cache.columnConfig.findIndex((c) => c.label === userConfigs[0].label);
      if (idx >= 0) cache.columnConfig.splice(idx, 1);
    }
    cache.columnConfig.push({ label: newConfigName, columns });
    writeStorage(this.originStorageKey, cache);
    this.storage.update((prev) =>
      prev.columnConfig.some((c) => c.label === newConfigName)
        ? prev
        : { ...prev, columnConfig: [...prev.columnConfig, { label: newConfigName, columns }] },
    );
  }

  removeConfigFromLocal(label: string): void {
    const cache = this.readRawCache();
    if (!cache || !cache.columnConfig) return;
    const idx = cache.columnConfig.findIndex((item) => item.label === label);
    if (idx < 0) return;
    cache.columnConfig.splice(idx, 1);
    writeStorage(this.originStorageKey, cache);
    this.storage.update((prev) => ({
      ...prev,
      columnConfig: prev.columnConfig.filter((c) => c.label !== label),
    }));
  }

  applyColumnConfig(config: ColumnConfig): void {
    if (!config || !config.label) return;
    const columns =
      !config.columns || !config.columns.length || config.columns.includes(ALL_FLAG)
        ? this.allProps()
        : config.columns;
    const { label } = config;

    this.storage.update((prev) => {
      const next = [...prev.columnConfig];
      const existIdx = next.findIndex((c) => c.label === label);
      if (existIdx === -1) next.push({ label, columns: [...columns] });
      else next[existIdx] = { ...next[existIdx], columns: [...columns] };
      return { activeColumnConfigLabel: label, columnConfig: next };
    });

    this.onLabelChange?.(label);

    const cache = this.readRawCache() || { activeColumnConfigLabel: label, columnConfig: [] };
    cache.activeColumnConfigLabel = label;
    const cacheIdx = cache.columnConfig.findIndex((c) => c.label === label);
    if (cacheIdx === -1) cache.columnConfig.push({ label, columns: [...columns] });
    else cache.columnConfig[cacheIdx].columns = [...columns];
    writeStorage(this.originStorageKey, cache);
  }

  /** 按 renderType 格式化单元格：float / percent / integer，空值显示 '-' */
  formatSchemaCell(val: unknown, schema: ColumnSchema): string {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);

    switch (schema.renderType) {
      case 'float': {
        const [digits = 2, noZero = true] = (schema.renderArgs || []) as [number?, boolean?];
        if (Number.isNaN(num)) return String(val);
        if (noZero && num === 0) return '-';
        return formatThousands(num.toFixed(digits)) || String(val);
      }
      case 'percent': {
        const [digits = 1, noZero = true] = (schema.renderArgs || []) as [number?, boolean?];
        if (Number.isNaN(num)) return String(val);
        if (noZero && num === 0) return '-';
        return `${(num * 100).toFixed(digits)}%`;
      }
      case 'integer': {
        if (Number.isNaN(num)) return String(val);
        return formatThousands(String(Math.round(num))) || String(val);
      }
      default:
        return String(val);
    }
  }
}

/** 创建自定义列状态；在组件字段初始化处调用，并经 `[kuSchemaColumnConfig]` 下发 */
export function createSchemaColumnConfig(options: SchemaColumnConfigOptions): SchemaColumnConfig {
  return new SchemaColumnConfig(options);
}
