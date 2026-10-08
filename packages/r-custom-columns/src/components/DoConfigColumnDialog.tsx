import { CloseOutlined, LockOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Checkbox, Drawer, Input, Popover, message as staticMessage } from 'antd';
import type { InputRef } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Sortable from 'sortablejs';

import { useOptionalSchemaColumnConfigContext } from '../context';
import type { ColumnConfig, TableColumnMeta } from '../types';
import { DEFAULT_CUSTOM_COLUMN_MESSAGES } from '../useSchemaColumnConfig';

import { DoReadColumnConfig } from './DoReadColumnConfig';

export interface DoConfigColumnDialogProps {
  /** 点击「完成」，携带当前配置 */
  onConfirm?: (config: ColumnConfig) => void;
}

export interface DoConfigColumnDialogRef {
  /** 打开抽屉；不传则用默认配置 */
  showConfigColumnDialog: (currentConfig?: ColumnConfig) => void;
}

/**
 * 自定义列配置抽屉：左侧分组导航、中间分组勾选、右侧已选列（固定区 + 拖拽排序），
 * 底部存到本地 / 读取本地 / 取消 / 完成。需在 SchemaColumnConfigContext 内使用。
 */
export const DoConfigColumnDialog = forwardRef<DoConfigColumnDialogRef, DoConfigColumnDialogProps>(
  function DoConfigColumnDialog({ onConfirm }, ref) {
    const ctx = useOptionalSchemaColumnConfigContext();
    const messages = ctx?.messages ?? DEFAULT_CUSTOM_COLUMN_MESSAGES;
    const noNameLabel = ctx?.noNameLabel || messages.noNameLabel;
    const maxCount = ctx?.maxSelectCount || 50;
    const { message: appMessage } = App.useApp();
    const message = typeof appMessage.warning === 'function' ? appMessage : staticMessage;

    const [visible, setVisible] = useState(false);
    const [popperSaveToLocal, setPopperSaveToLocal] = useState(false);
    const [popperReadFromLocal, setPopperReadFromLocal] = useState(false);
    const [columnList, setColumnList] = useState<TableColumnMeta[]>([]);
    const [emitColumnConfig, setEmitColumnConfig] = useState<TableColumnMeta[]>([]);
    const [newConfigName, setNewConfigName] = useState(noNameLabel);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [activeNavGroup, setActiveNavGroup] = useState('');

    const midPanelRef = useRef<HTMLDivElement>(null);
    const groupRefs = useRef(new Map<string, HTMLElement>());
    const inputConfigNameRef = useRef<InputRef>(null);
    const [dragZoneEl, setDragZoneEl] = useState<HTMLDivElement | null>(null);

    const unableToControl = (col: TableColumnMeta): boolean =>
      col.type === 'selection' ||
      col.fixed ||
      col.label === messages.operationColumnLabel ||
      col.label === '操作';

    const groupOf = (col: TableColumnMeta) => col.group || messages.groupFallback;

    const uniqueGroups = useMemo(() => {
      const seen = new Set<string>();
      columnList.forEach((item) => seen.add(item.group || messages.groupFallback));
      return [...seen];
    }, [columnList, messages.groupFallback]);

    const filteredGroups = useMemo(() => {
      const keyword = searchKeyword.trim().toLowerCase();
      const groupMap = new Map<string, TableColumnMeta[]>();
      columnList.forEach((item) => {
        if (keyword && !item.label.toLowerCase().includes(keyword)) return;
        const g = item.group || messages.groupFallback;
        if (!groupMap.has(g)) groupMap.set(g, []);
        groupMap.get(g)!.push(item);
      });
      return uniqueGroups
        .filter((g) => groupMap.has(g))
        .map((g) => ({ label: g, children: groupMap.get(g)! }));
    }, [columnList, searchKeyword, uniqueGroups, messages.groupFallback]);

    const alwaysCols = useMemo<TableColumnMeta[]>(
      () =>
        (ctx?.alwaysVisibleColumns || []).map((col) => ({
          property: col.prop,
          label: col.label,
          fixed: true,
          group: messages.groupFallback,
          isLeaf: true,
          visible: true,
          _alwaysVisible: true,
        })),
      [ctx?.alwaysVisibleColumns, messages.groupFallback],
    );

    const fixedSelectedCols = [...alwaysCols, ...emitColumnConfig.filter(unableToControl)];
    const draggableList = emitColumnConfig.filter((col) => !unableToControl(col));

    /** 与本地缓存逐一比对，命中则沿用其名称，否则视为未命名 */
    const matchConfigName = (cols: TableColumnMeta[]): string | null => {
      const cache = ctx?.readCacheConfig();
      if (!cache) return null;
      const temp = JSON.stringify(cols.map((item) => item.property));
      const hit = cache.columnConfig.filter((config) => JSON.stringify(config.columns) === temp);
      return hit.length ? hit[hit.length - 1].label : noNameLabel;
    };

    const commitEmit = (cols: TableColumnMeta[]) => {
      setEmitColumnConfig(cols);
      const name = matchConfigName(cols);
      if (name !== null) setNewConfigName(name);
    };

    const syncEmitWithVisible = (list: TableColumnMeta[]) => {
      const visibleProps = list.filter((col) => col.visible).map((col) => col.property);
      const next = emitColumnConfig.filter((col) => visibleProps.includes(col.property));
      visibleProps.forEach((property) => {
        if (next.some((col) => col.property === property)) return;
        const col = list.find((c) => c.property === property);
        if (col) next.push(col);
      });
      setColumnList(list);
      commitEmit(next);
    };

    const applyConfig = (columnConfig: ColumnConfig) => {
      if (!ctx) return;
      setNewConfigName(columnConfig.label);
      const allColumns = ctx.tableColumns.map((item) => ({
        ...item,
        visible: columnConfig.columns.includes(item.property as string),
      }));
      setColumnList(allColumns);
      setEmitColumnConfig(
        columnConfig.columns
          .map((property) => allColumns.find((col) => col.property === property))
          .filter((col): col is TableColumnMeta => !!col),
      );
    };

    useImperativeHandle(ref, () => ({
      showConfigColumnDialog(currentConfig?: ColumnConfig) {
        if (!ctx) return;
        const columnConfig = currentConfig || ctx.getDefaultConfig();
        if (!columnConfig) return;
        applyConfig(columnConfig);
        const first = ctx.tableColumns[0];
        setActiveNavGroup(first ? first.group || messages.groupFallback : '');
        setSearchKeyword('');
        setVisible(true);
      },
    }));

    const closePoppers = () => {
      setPopperSaveToLocal(false);
      setPopperReadFromLocal(false);
    };

    const cancelColumnConfig = () => {
      closePoppers();
      setVisible(false);
      ctx?.onDialogClose?.();
    };

    const confirmColumnConfig = () => {
      closePoppers();
      setVisible(false);
      onConfirm?.({
        label: newConfigName || noNameLabel,
        columns: emitColumnConfig
          .filter((config) => !config._alwaysVisible)
          .map((config) => config.property as string),
      });
    };

    const resetConfig = () => {
      const defaultConfig = ctx?.getDefaultConfig();
      if (!defaultConfig) return;
      applyConfig(defaultConfig);
      const allColumns = ctx!.tableColumns;
      const name = matchConfigName(
        defaultConfig.columns
          .map((property) => allColumns.find((col) => col.property === property))
          .filter((col): col is TableColumnMeta => !!col),
      );
      if (name !== null) setNewConfigName(name);
    };

    const toggleColumnCheck = (checked: boolean, col: TableColumnMeta) => {
      if (checked && !unableToControl(col)) {
        const willCount = draggableList.length + 1;
        if (willCount > maxCount) {
          message.warning(messages.maxSelectedWarning(maxCount));
          return;
        }
      }
      syncEmitWithVisible(
        columnList.map((item) =>
          item.property === col.property ? { ...item, visible: checked } : item,
        ),
      );
    };

    const groupSelect = (group: string, pick: (item: TableColumnMeta) => boolean) => {
      syncEmitWithVisible(
        columnList.map((item) =>
          !unableToControl(item) && groupOf(item) === group
            ? { ...item, visible: pick(item) }
            : item,
        ),
      );
    };

    const removeSelectedItem = (property?: string) => {
      setColumnList(
        columnList.map((item) => (item.property === property ? { ...item, visible: false } : item)),
      );
      commitEmit(emitColumnConfig.filter((c) => c.property !== property));
    };

    const emitRef = useRef(emitColumnConfig);
    emitRef.current = emitColumnConfig;
    const reorderRef = useRef<(oldIndex: number, newIndex: number) => void>(() => {});
    reorderRef.current = (oldIndex, newIndex) => {
      const current = emitRef.current;
      const reordered = current.filter((col) => !unableToControl(col));
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      const schemaFixed = current.filter((col) => unableToControl(col) && !col._alwaysVisible);
      commitEmit([...schemaFixed, ...reordered]);
    };

    useEffect(() => {
      if (!dragZoneEl) return;
      const sortable = Sortable.create(dragZoneEl, {
        animation: 200,
        handle: '.sel-drag-handle',
        onUpdate(evt) {
          const { item, from, oldIndex, newIndex } = evt;
          if (oldIndex === undefined || newIndex === undefined) return;
          // 还原 Sortable 的 DOM 移动，交由 React 按新顺序渲染
          from.removeChild(item);
          from.insertBefore(item, from.children[oldIndex] ?? null);
          reorderRef.current(oldIndex, newIndex);
        },
      });
      return () => sortable.destroy();
    }, [dragZoneEl]);

    const scrollToGroup = (group: string) => {
      setActiveNavGroup(group);
      const domEl = groupRefs.current.get(group);
      const panel = midPanelRef.current;
      if (domEl && panel) {
        panel.scrollTo({ top: domEl.offsetTop - panel.offsetTop, behavior: 'smooth' });
      }
    };

    const onMidScroll = () => {
      const panel = midPanelRef.current;
      if (!panel) return;
      const { scrollTop } = panel;
      for (let i = uniqueGroups.length - 1; i >= 0; i--) {
        const domEl = groupRefs.current.get(uniqueGroups[i]);
        if (!domEl) continue;
        if (domEl.offsetTop - panel.offsetTop <= scrollTop + 8) {
          setActiveNavGroup(uniqueGroups[i]);
          break;
        }
      }
    };

    const applyReadConfig = (config: ColumnConfig) => {
      if (!ctx || !config || !config.label || !columnList.length) return;
      const columns =
        !config.columns || !config.columns.length || config.columns.includes('ALL')
          ? ctx.tableColumns.map((each) => each.property as string)
          : config.columns;
      setPopperReadFromLocal(false);
      setNewConfigName(config.label);
      const list = columnList.map((item) => ({
        ...item,
        visible: columns.includes(item.property as string),
      }));
      setColumnList(list);
      setEmitColumnConfig(
        columns
          .map((property) => list.find((col) => col.property === property))
          .filter((col): col is TableColumnMeta => !!col),
      );
    };

    const toSaveToLocal = () => {
      setNewConfigName('');
      setPopperSaveToLocal(true);
      setPopperReadFromLocal(false);
    };

    useEffect(() => {
      if (!popperSaveToLocal) return;
      const id = requestAnimationFrame(() => inputConfigNameRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }, [popperSaveToLocal]);

    const doSaveToLocal = () => {
      if (!ctx || !newConfigName || !newConfigName.trim()) {
        message.warning(messages.configNameRequired);
        return;
      }
      const configName = newConfigName.trim();
      if (ctx.readCacheConfig()?.columnConfig?.some((c) => c.label === configName)) {
        message.warning(messages.configNameExists);
        return;
      }
      ctx.saveConfigToLocal(
        configName,
        emitColumnConfig.map((config) => config.property as string),
      );
      setPopperSaveToLocal(false);
      message.success(messages.configSaved);
    };

    const cancelSaveToLocal = () => {
      const name = matchConfigName(emitColumnConfig);
      if (name !== null) setNewConfigName(name);
      setPopperSaveToLocal(false);
    };

    return (
      <Drawer
        open={visible}
        onClose={cancelColumnConfig}
        className="do-config-column-dialog"
        width={1000}
        placement="right"
        closable={false}
        title={
          <span className="drawer-title">
            {messages.customColumns}{' '}
            <span
              className={[
                'tips',
                newConfigName === noNameLabel ? 'status-warning' : 'status-success',
              ].join(' ')}
            >
              ({newConfigName})
            </span>
          </span>
        }
        extra={
          <button
            type="button"
            className="drawer-close"
            aria-label="Close"
            onClick={cancelColumnConfig}
          >
            <CloseOutlined />
          </button>
        }
      >
        <div className="drawer-wrap">
          <div className="col-dialog-body">
            <div className="cfg-search">
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={messages.searchPlaceholder}
                allowClear
                size="small"
                prefix={<SearchOutlined />}
              />
            </div>

            <div className="cfg-panels">
              <div className="cfg-left">
                {uniqueGroups.map((group) => (
                  <div
                    key={group}
                    className={['nav-link', activeNavGroup === group ? 'active' : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => scrollToGroup(group)}
                  >
                    {group}
                  </div>
                ))}
              </div>

              <div
                ref={midPanelRef}
                className="cfg-mid"
                onScroll={onMidScroll}
              >
                {filteredGroups.map((group) => (
                  <div
                    key={group.label}
                    ref={(el) => {
                      if (el) groupRefs.current.set(group.label, el);
                      else groupRefs.current.delete(group.label);
                    }}
                    className="grp-section"
                  >
                    <div className="grp-head">
                      <span className="grp-label">{group.label}</span>
                      <span className="grp-actions">
                        <a onClick={() => groupSelect(group.label, () => true)}>
                          {messages.selectAll}
                        </a>
                        <a onClick={() => groupSelect(group.label, (item) => !item.visible)}>
                          {messages.invertSelection}
                        </a>
                      </span>
                    </div>
                    <div className="grp-grid">
                      {group.children.map((col) => (
                        <div
                          key={col.property}
                          className="grp-item"
                        >
                          <Checkbox
                            checked={col.visible}
                            disabled={unableToControl(col)}
                            onChange={(e) => toggleColumnCheck(e.target.checked, col)}
                          >
                            {col.label}
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredGroups.length === 0 ? (
                  <div className="grp-empty">{messages.emptySearch}</div>
                ) : null}
              </div>

              <div className="cfg-right">
                <div className="sel-header">
                  <span className="sel-count">
                    {messages.selectedCount(emitColumnConfig.length, maxCount)}
                  </span>
                  <a
                    className="sel-reset"
                    onClick={resetConfig}
                  >
                    {messages.reset}
                  </a>
                </div>

                <div className="sel-body">
                  {fixedSelectedCols.length ? (
                    <>
                      <div className="sel-fix-zone">
                        {fixedSelectedCols.map((col) => (
                          <div
                            key={col.property}
                            className="sel-fix-row"
                          >
                            <LockOutlined className="sel-lock" />
                            <span className="sel-fix-name">{col.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="sel-sepline">
                        <span className="sel-septip">{messages.fixedColumnsTip}</span>
                      </div>
                    </>
                  ) : null}

                  <div className="sel-drag-zone">
                    <div ref={setDragZoneEl}>
                      {draggableList.map((col) => (
                        <div
                          key={col.property}
                          className="sel-drag-row"
                        >
                          <span className="sel-drag-handle">
                            <span className="sel-drag-dots" />
                          </span>
                          <span
                            className="sel-drag-name"
                            title={col.label}
                          >
                            {col.label}
                          </span>
                          <CloseOutlined
                            className="sel-remove"
                            onClick={() => removeSelectedItem(col.property)}
                          />
                        </div>
                      ))}
                    </div>
                    {draggableList.length === 0 ? (
                      <div className="sel-empty">{messages.emptySelected}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="drawer-foot">
            <div className="left-btn-group">
              <Popover
                open={popperSaveToLocal}
                placement="top"
                trigger={[]}
                rootClassName="save-to-local-popper"
                content={
                  <div className="save-to-local-form">
                    <Input
                      ref={inputConfigNameRef}
                      className="storage-key-will-save"
                      value={newConfigName}
                      onChange={(e) => setNewConfigName(e.target.value)}
                      placeholder={messages.configNamePlaceholder}
                    />
                    <Button
                      size="small"
                      onClick={cancelSaveToLocal}
                    >
                      {messages.cancel}
                    </Button>
                    <Button
                      size="small"
                      onClick={doSaveToLocal}
                    >
                      {messages.save}
                    </Button>
                  </div>
                }
              >
                <Button onClick={toSaveToLocal}>{messages.saveToLocal}</Button>
              </Popover>

              <Popover
                open={popperReadFromLocal}
                onOpenChange={(open) => {
                  setPopperReadFromLocal(open);
                  if (open) setPopperSaveToLocal(false);
                }}
                placement="top"
                trigger="click"
                rootClassName="read-from-local-popper"
                content={
                  <DoReadColumnConfig
                    onConfirm={applyReadConfig}
                    onRemove={(label) => ctx?.removeConfigFromLocal(label)}
                    onClosed={() => setPopperReadFromLocal(false)}
                  />
                }
              >
                <Button>{messages.readFromLocal}</Button>
              </Popover>
            </div>

            <div className="right-btn-group">
              <Button onClick={cancelColumnConfig}>{messages.cancel}</Button>
              <Button
                type="primary"
                onClick={confirmColumnConfig}
              >
                {messages.complete}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    );
  },
);
