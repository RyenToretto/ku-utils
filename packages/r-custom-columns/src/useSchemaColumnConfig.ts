import { formatThousands } from '@ku-utils/utils';
import { useCallback, useMemo, useRef, useState } from 'react';

import type {
  ColumnConfig,
  ColumnSchema,
  CustomColumnMessages,
  SchemaColumnConfigOptions,
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

function flattenLeafSchemas(schemas: ColumnSchema[]): ColumnSchema[] {
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
  const leaves: string[] = [];
  (schemas || []).forEach((s) => {
    if (s.children && s.children.length) {
      leaves.push(...getLeafProps(s.children));
    } else if (s.prop) {
      leaves.push(s.prop);
    }
  });
  return leaves;
}

function pruneVisibleTree(schemas: ColumnSchema[], activeCols: string[] | null): ColumnSchema[] {
  if (!Array.isArray(schemas)) return [];
  const result = schemas.reduce<ColumnSchema[]>((acc, schema) => {
    if (schema.alwaysVisible) return acc;
    if (schema.children && schema.children.length) {
      const visibleChildren = pruneVisibleTree(schema.children, activeCols);
      if (visibleChildren.length > 0) {
        acc.push({ ...schema, children: visibleChildren });
      }
    } else {
      const isVisible = !activeCols || (schema.prop ? activeCols.includes(schema.prop) : false);
      if (isVisible) acc.push(schema);
    }
    return acc;
  }, []);

  if (activeCols && activeCols.length) {
    const getFirstOrder = (node: ColumnSchema): number => {
      if (!node.children || !node.children.length) {
        const idx = node.prop ? activeCols.indexOf(node.prop) : -1;
        return idx >= 0 ? idx : Infinity;
      }
      let min = Infinity;
      const walk = (children: ColumnSchema[]) => {
        children.forEach((child) => {
          if (child.children && child.children.length) {
            walk(child.children);
          } else if (child.prop) {
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
}

function resolveStorageKey(storageKey: string, schemaVersion: number): string {
  const pathStr =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\//g, '_') : 'default';
  return `${storageKey}_${pathStr}_sv${schemaVersion}`;
}

function createInitialState(
  options: SchemaColumnConfigOptions,
  messages: CustomColumnMessages,
): TableStorage {
  const defaultConfigLabel = options.defaultConfigLabel || messages.defaultConfigLabel;
  const storageKey = options.storageKey || 'schema_col_config';
  const schemaVersion = options.schemaVersion ?? 1;
  const columnSchemas = options.columnSchemas || [];
  const originKey = resolveStorageKey(storageKey, schemaVersion);

  const base: TableStorage = {
    activeColumnConfigLabel: defaultConfigLabel,
    columnConfig: [{ label: defaultConfigLabel, columns: [] }],
  };

  if (typeof window === 'undefined') return base;

  try {
    const raw = window.localStorage.getItem(originKey);
    if (!raw) {
      const all = flattenLeafSchemas(columnSchemas).filter((s) => !s.alwaysVisible);
      const defaultCols = all.filter((s) => s.isDefault);
      base.columnConfig[0].columns = (defaultCols.length ? defaultCols : all)
        .map((s) => s.prop)
        .filter((p): p is string => !!p);
      window.localStorage.setItem(originKey, JSON.stringify(base));
      return base;
    }

    const cached = JSON.parse(raw) as TableStorage;
    base.activeColumnConfigLabel = cached.activeColumnConfigLabel || defaultConfigLabel;
    const systemLabels = [defaultConfigLabel];

    if (Array.isArray(cached.columnConfig)) {
      cached.columnConfig.forEach((each) => {
        if (!each) return;
        const isSystem = systemLabels.includes(each.label);
        if (isSystem) {
          const existing = base.columnConfig.find((c) => c.label === each.label);
          if (existing && Array.isArray(each.columns)) {
            existing.columns = [...each.columns];
          }
        } else {
          base.columnConfig.push({
            label: each.label,
            columns: Array.isArray(each.columns) ? [...each.columns] : [],
          });
        }
      });
    }
  } catch {
    // ignore corrupt cache
  }

  return base;
}

/**
 * React 自定义列核心 hook（schema 驱动）。
 *
 * 返回可见列与 localStorage 持久化能力；经 SchemaColumnConfigContext 下发给 DoTableHeader（内含配置抽屉）。
 */
export function useSchemaColumnConfig(options: SchemaColumnConfigOptions) {
  const {
    columnSchemas,
    storageKey = 'schema_col_config',
    schemaVersion = 1,
    alwaysVisibleColumns = [],
    maxConfigCount = 10,
    maxSelectCount = 50,
    messages: messageOverrides = {},
    onDialogClose = null,
    onLabelChange = null,
  } = options;

  const messages: CustomColumnMessages = useMemo(
    () => ({
      ...DEFAULT_CUSTOM_COLUMN_MESSAGES,
      ...messageOverrides,
    }),
    [messageOverrides],
  );

  const defaultConfigLabel = options.defaultConfigLabel || messages.defaultConfigLabel;
  const noNameLabel = options.noNameLabel || messages.noNameLabel;
  const systemConfigLabel = useMemo(() => [defaultConfigLabel], [defaultConfigLabel]);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [storage, setStorage] = useState<TableStorage>(() => createInitialState(options, messages));

  const originStorageKey = useMemo(
    () => resolveStorageKey(storageKey, schemaVersion),
    [storageKey, schemaVersion],
  );

  const getConfigurableSchemas = useCallback((): ColumnSchema[] => {
    const schemas = optionsRef.current.columnSchemas;
    if (!Array.isArray(schemas)) {
      console.warn('[useSchemaColumnConfig] columnSchemas 未定义');
      return [];
    }
    return flattenLeafSchemas(schemas).filter((s) => !s.alwaysVisible);
  }, []);

  const getActiveConfig = useCallback((): ColumnConfig | null => {
    return storage.columnConfig.find((c) => c.label === storage.activeColumnConfigLabel) || null;
  }, [storage]);

  const isSchemaVisible = useCallback(
    (prop: string | undefined, activeConfig: ColumnConfig | null): boolean => {
      if (!activeConfig || !activeConfig.columns || !activeConfig.columns.length) return true;
      if (activeConfig.columns.includes(ALL_FLAG)) return true;
      return !!prop && activeConfig.columns.includes(prop);
    },
    [],
  );

  const readRawCache = useCallback((): TableStorage | null => {
    try {
      const data = window.localStorage.getItem(originStorageKey);
      return data ? (JSON.parse(data) as TableStorage) : null;
    } catch {
      return null;
    }
  }, [originStorageKey]);

  const writeCache = useCallback(
    (config?: TableStorage): void => {
      try {
        const value = config || storage;
        if (!value || !value.columnConfig) return;
        window.localStorage.setItem(originStorageKey, JSON.stringify(value));
      } catch (e) {
        const err = e as { name?: string; code?: number };
        if (err.name === 'QuotaExceededError' || err.code === 22) {
          console.error('[useSchemaColumnConfig] localStorage 存储空间不足');
        }
      }
    },
    [originStorageKey, storage],
  );

  const tableColumns = useMemo<TableColumnMeta[]>(() => {
    const schemas = getConfigurableSchemas();
    const activeConfig = getActiveConfig();
    return schemas.map((schema) => ({
      property: schema.prop,
      label: schema.label,
      fixed: !!schema.fixed,
      group: schema.group || messages.groupFallback,
      isLeaf: true,
      visible: isSchemaVisible(schema.prop, activeConfig),
    }));
  }, [getConfigurableSchemas, getActiveConfig, isSchemaVisible, messages.groupFallback, storage]);

  const visibleSchemas = useMemo<ColumnSchema[]>(() => {
    const schemas = columnSchemas || [];
    const activeConfig = getActiveConfig();
    const allLeaves = getConfigurableSchemas();
    const hasNesting = schemas.some((s) => s.children && s.children.length);

    const isFullVisible =
      !activeConfig ||
      !activeConfig.columns ||
      !activeConfig.columns.length ||
      activeConfig.columns.includes(ALL_FLAG);

    if (hasNesting) {
      const activeCols = isFullVisible ? null : activeConfig!.columns;
      return pruneVisibleTree(
        schemas.filter((s) => !s.alwaysVisible),
        activeCols,
      );
    }

    if (isFullVisible) return allLeaves;

    const propSet = new Set(allLeaves.map((s) => s.prop));
    const schemaMap = new Map(allLeaves.map((s) => [s.prop, s]));
    return activeConfig!.columns
      .filter((prop) => propSet.has(prop))
      .map((prop) => schemaMap.get(prop))
      .filter((s): s is ColumnSchema => !!s);
  }, [columnSchemas, getActiveConfig, getConfigurableSchemas, storage]);

  const tableRenderKey = useMemo(() => getLeafProps(visibleSchemas).join(','), [visibleSchemas]);

  const readCacheConfig = useCallback((): TableStorage | null => {
    const raw = readRawCache();
    if (!raw) return null;
    const allProps = getConfigurableSchemas()
      .map((s) => s.prop)
      .filter((p): p is string => !!p);
    if (raw.columnConfig) {
      raw.columnConfig = raw.columnConfig.map((config) => {
        if (
          config.label === defaultConfigLabel &&
          (!config.columns || config.columns.length === 0)
        ) {
          return { ...config, columns: allProps };
        }
        return config;
      });
    }
    return raw;
  }, [readRawCache, getConfigurableSchemas, defaultConfigLabel]);

  const getDefaultConfig = useCallback((): ColumnConfig | null => {
    const idx = storage.columnConfig.findIndex((item) => item.label === defaultConfigLabel);
    if (idx < 0) return null;
    const config = storage.columnConfig[idx];
    if (!config.columns || config.columns.length === 0) {
      return {
        ...config,
        columns: getConfigurableSchemas()
          .map((s) => s.prop)
          .filter((p): p is string => !!p),
      };
    }
    return config;
  }, [storage.columnConfig, defaultConfigLabel, getConfigurableSchemas]);

  const existAlreadyWithSystem = useCallback(
    (label: string): boolean => systemConfigLabel.includes(label),
    [systemConfigLabel],
  );

  const cleanupExcessConfigs = useCallback(
    (cache: TableStorage): void => {
      if (!cache || !cache.columnConfig) return;
      const userConfigs = cache.columnConfig.filter((c) => !existAlreadyWithSystem(c.label));
      if (userConfigs.length >= maxConfigCount) {
        const oldest = userConfigs[0];
        const idx = cache.columnConfig.findIndex((c) => c.label === oldest.label);
        if (idx >= 0) cache.columnConfig.splice(idx, 1);
      }
    },
    [existAlreadyWithSystem, maxConfigCount],
  );

  const saveConfigToLocal = useCallback(
    (newConfigName: string, columns: string[]): void => {
      const cache = readRawCache();
      if (!cache || !cache.columnConfig) return;
      cleanupExcessConfigs(cache);
      cache.columnConfig.push({ label: newConfigName, columns });
      writeCache(cache);
      setStorage((prev) => {
        if (prev.columnConfig.find((c) => c.label === newConfigName)) return prev;
        return {
          ...prev,
          columnConfig: [...prev.columnConfig, { label: newConfigName, columns }],
        };
      });
    },
    [readRawCache, cleanupExcessConfigs, writeCache],
  );

  const removeConfigFromLocal = useCallback(
    (label: string): void => {
      const cache = readRawCache();
      if (!cache || !cache.columnConfig) return;
      const idx = cache.columnConfig.findIndex((item) => item.label === label);
      if (idx < 0) return;
      cache.columnConfig.splice(idx, 1);
      writeCache(cache);
      setStorage((prev) => ({
        ...prev,
        columnConfig: prev.columnConfig.filter((c) => c.label !== label),
      }));
    },
    [readRawCache, writeCache],
  );

  const applyColumnConfig = useCallback(
    (config: ColumnConfig): void => {
      if (!config || !config.label) return;
      const schemas = getConfigurableSchemas();
      const allProps = schemas.map((s) => s.prop).filter((p): p is string => !!p);

      const columns =
        !config.columns || !config.columns.length || config.columns.includes(ALL_FLAG)
          ? allProps
          : config.columns;
      const { label } = config;

      setStorage((prev) => {
        const nextConfigs = [...prev.columnConfig];
        const existIdx = nextConfigs.findIndex((c) => c.label === label);
        if (existIdx === -1) {
          nextConfigs.push({ label, columns: [...columns] });
        } else {
          nextConfigs[existIdx] = { ...nextConfigs[existIdx], columns: [...columns] };
        }
        return {
          activeColumnConfigLabel: label,
          columnConfig: nextConfigs,
        };
      });

      onLabelChange?.(label);

      const cache = readRawCache() || { activeColumnConfigLabel: label, columnConfig: [] };
      cache.activeColumnConfigLabel = label;
      const cacheIdx = cache.columnConfig.findIndex((c) => c.label === label);
      if (cacheIdx === -1) {
        cache.columnConfig.push({ label, columns: [...columns] });
      } else {
        cache.columnConfig[cacheIdx].columns = [...columns];
      }
      try {
        window.localStorage.setItem(originStorageKey, JSON.stringify(cache));
      } catch (e) {
        const err = e as { name?: string; code?: number };
        if (err.name === 'QuotaExceededError' || err.code === 22) {
          console.error('[useSchemaColumnConfig] localStorage 存储空间不足');
        }
      }
    },
    [getConfigurableSchemas, onLabelChange, readRawCache, originStorageKey],
  );

  const formatSchemaCell = useCallback((val: unknown, schema: ColumnSchema): string => {
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
  }, []);

  return {
    /** 当前可见列 schema（已按配置过滤/排序） */
    visibleSchemas,
    tableColumns,
    tableRenderKey,
    activeColumnConfigLabel: storage.activeColumnConfigLabel,
    columnConfig: storage.columnConfig,
    messages,
    maxSelectCount,
    noNameLabel,
    defaultConfigLabel,
    alwaysVisibleColumns,
    readCacheConfig,
    getDefaultConfig,
    applyColumnConfig,
    saveConfigToLocal,
    removeConfigFromLocal,
    formatSchemaCell,
    existAlreadyWithSystem,
    onDialogClose,
  };
}

export type SchemaColumnConfigReturn = ReturnType<typeof useSchemaColumnConfig>;
