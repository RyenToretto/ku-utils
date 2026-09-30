import { Button, Checkbox, Input, Modal, message as antdMessage } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useOptionalSchemaColumnConfigContext } from '../context';
import type { CustomColumnMessages, TableColumnMeta } from '../types';
import { DEFAULT_CUSTOM_COLUMN_MESSAGES } from '../useSchemaColumnConfig';

export interface DoConfigColumnDialogProps {
  open?: boolean;
  onCancel?: () => void;
  /** 保存时回调选中的 prop 列表（按当前顺序） */
  onSave?: (columns: string[]) => void;
  onReset?: () => void;
  tableColumns?: TableColumnMeta[];
  messages?: CustomColumnMessages;
  maxSelectCount?: number;
  /** 初始选中的 prop（打开时同步）；不传则从 tableColumns.visible 推导 */
  initialSelected?: string[];
}

interface DraftColumn {
  property: string;
  label: string;
  fixed: boolean;
  group: string;
  checked: boolean;
}

/**
 * 自定义列配置弹窗（MVP）：
 * - 左侧分组勾选
 * - 右侧已选列表 + 上移/下移排序
 * - 保存 / 取消 / 重置
 */
export function DoConfigColumnDialog(props: DoConfigColumnDialogProps) {
  const ctx = useOptionalSchemaColumnConfigContext();

  const open = props.open ?? ctx?.configVisible ?? false;
  const messages = props.messages ?? ctx?.messages ?? DEFAULT_CUSTOM_COLUMN_MESSAGES;
  const maxSelectCount = props.maxSelectCount ?? ctx?.maxSelectCount ?? 50;
  const tableColumns = props.tableColumns ?? ctx?.tableColumns ?? [];

  const onCancel = props.onCancel ?? ctx?.closeConfig;
  const onSave =
    props.onSave ??
    ((columns: string[]) => {
      ctx?.applyConfig(columns);
      ctx?.closeConfig();
    });
  const onReset =
    props.onReset ??
    (() => {
      ctx?.resetConfig();
    });

  const [keyword, setKeyword] = useState('');
  const [draft, setDraft] = useState<DraftColumn[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);

  const syncFromProps = useCallback(() => {
    const cols: DraftColumn[] = tableColumns
      .filter((c) => c.property)
      .map((c) => ({
        property: c.property as string,
        label: c.label,
        fixed: c.fixed,
        group: c.group,
        checked: false,
      }));

    const initial =
      props.initialSelected ??
      tableColumns.filter((c) => c.visible && c.property).map((c) => c.property as string);

    const order = initial.filter((p) => cols.some((c) => c.property === p));
    // fixed 列始终选中并排在最前
    const fixedProps = cols.filter((c) => c.fixed).map((c) => c.property);
    const merged = [...fixedProps, ...order.filter((p) => !fixedProps.includes(p))];

    setDraft(
      cols.map((c) => ({
        ...c,
        checked: merged.includes(c.property) || c.fixed,
      })),
    );
    setSelectedOrder(merged);
    setKeyword('');
  }, [tableColumns, props.initialSelected]);

  useEffect(() => {
    if (open) syncFromProps();
  }, [open, syncFromProps]);

  const filteredGroups = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const map = new Map<string, DraftColumn[]>();
    draft.forEach((col) => {
      if (kw && !col.label.toLowerCase().includes(kw) && !col.property.toLowerCase().includes(kw)) {
        return;
      }
      const list = map.get(col.group) || [];
      list.push(col);
      map.set(col.group, list);
    });
    return Array.from(map.entries()).map(([label, children]) => ({ label, children }));
  }, [draft, keyword]);

  const selectedColumns = useMemo(() => {
    const map = new Map(draft.map((c) => [c.property, c]));
    return selectedOrder.map((p) => map.get(p)).filter((c): c is DraftColumn => !!c);
  }, [draft, selectedOrder]);

  const selectedCount = selectedOrder.length;

  const toggleColumn = (property: string, checked: boolean) => {
    const col = draft.find((c) => c.property === property);
    if (!col || col.fixed) return;

    if (checked && selectedCount >= maxSelectCount) {
      antdMessage.warning(messages.maxSelectedWarning(maxSelectCount));
      return;
    }

    setDraft((prev) => prev.map((c) => (c.property === property ? { ...c, checked } : c)));
    setSelectedOrder((prev) => {
      if (checked) return prev.includes(property) ? prev : [...prev, property];
      return prev.filter((p) => p !== property);
    });
  };

  const groupAllSelect = (group: string) => {
    const targets = draft.filter((c) => c.group === group && !c.fixed && !c.checked);
    const room = maxSelectCount - selectedCount;
    if (room <= 0) {
      antdMessage.warning(messages.maxSelectedWarning(maxSelectCount));
      return;
    }
    const toAdd = targets.slice(0, room).map((c) => c.property);
    if (toAdd.length < targets.length) {
      antdMessage.warning(messages.maxSelectedWarning(maxSelectCount));
    }
    setDraft((prev) => prev.map((c) => (toAdd.includes(c.property) ? { ...c, checked: true } : c)));
    setSelectedOrder((prev) => [...prev, ...toAdd.filter((p) => !prev.includes(p))]);
  };

  const groupInvertSelect = (group: string) => {
    const groupCols = draft.filter((c) => c.group === group && !c.fixed);
    const nextChecked = new Set(selectedOrder);
    groupCols.forEach((c) => {
      if (nextChecked.has(c.property)) nextChecked.delete(c.property);
      else nextChecked.add(c.property);
    });
    if (nextChecked.size > maxSelectCount) {
      antdMessage.warning(messages.maxSelectedWarning(maxSelectCount));
      return;
    }
    setDraft((prev) =>
      prev.map((c) => {
        if (c.fixed) return { ...c, checked: true };
        if (c.group !== group) return c;
        return { ...c, checked: nextChecked.has(c.property) };
      }),
    );
    // 保持原顺序，再追加新选中
    setSelectedOrder((prev) => {
      const fixed = draft.filter((c) => c.fixed).map((c) => c.property);
      const kept = prev.filter((p) => nextChecked.has(p) && !fixed.includes(p));
      const added = [...nextChecked].filter((p) => !fixed.includes(p) && !kept.includes(p));
      return [...fixed, ...kept, ...added];
    });
  };

  const moveSelected = (property: string, direction: -1 | 1) => {
    setSelectedOrder((prev) => {
      const idx = prev.indexOf(property);
      if (idx < 0) return prev;
      const col = draft.find((c) => c.property === property);
      if (col?.fixed) return prev;
      const fixedCount = draft.filter((c) => c.fixed).length;
      const nextIdx = idx + direction;
      if (nextIdx < fixedCount || nextIdx >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[idx];
      next[idx] = next[nextIdx];
      next[nextIdx] = tmp;
      return next;
    });
  };

  const handleSave = () => {
    onSave?.(selectedOrder);
  };

  const handleReset = () => {
    onReset?.();
    // 重置后用默认可见重同步
    const defaults = tableColumns
      .filter((c) => c.property)
      .map((c) => c as TableColumnMeta & { property: string });
    // resetConfig 会更新外部状态；弹窗内先按 isDefault/全量视觉回退到当前 visible 重载
    const next = defaults.filter((c) => c.visible).map((c) => c.property);
    const fixedProps = defaults.filter((c) => c.fixed).map((c) => c.property);
    const merged = [...fixedProps, ...next.filter((p) => !fixedProps.includes(p))];
    setDraft((prev) =>
      prev.map((c) => ({
        ...c,
        checked: merged.includes(c.property) || c.fixed,
      })),
    );
    setSelectedOrder(merged.length ? merged : defaults.map((c) => c.property));
  };

  return (
    <Modal
      className="do-config-column-dialog"
      title={messages.customColumns}
      open={open}
      onCancel={() => onCancel?.()}
      width={720}
      destroyOnHidden
      footer={[
        <Button
          key="reset"
          onClick={handleReset}
        >
          {messages.reset}
        </Button>,
        <Button
          key="cancel"
          onClick={() => onCancel?.()}
        >
          {messages.cancel}
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
        >
          {messages.save}
        </Button>,
      ]}
    >
      <div className="cfg-search">
        <Input
          allowClear
          size="small"
          placeholder={messages.searchPlaceholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="cfg-panels">
        <div className="cfg-mid">
          {filteredGroups.map((group) => (
            <div
              key={group.label}
              className="grp-section"
            >
              <div className="grp-head">
                <span className="grp-label">{group.label}</span>
                <span className="grp-actions">
                  <a
                    href="#select-all"
                    onClick={(e) => {
                      e.preventDefault();
                      groupAllSelect(group.label);
                    }}
                  >
                    {messages.selectAll}
                  </a>
                  <a
                    href="#invert"
                    onClick={(e) => {
                      e.preventDefault();
                      groupInvertSelect(group.label);
                    }}
                  >
                    {messages.invertSelection}
                  </a>
                </span>
              </div>
              <div className="grp-grid">
                {group.children.map((col) => (
                  <label
                    key={col.property}
                    className="grp-item"
                  >
                    <Checkbox
                      checked={col.checked}
                      disabled={col.fixed}
                      onChange={(e) => toggleColumn(col.property, e.target.checked)}
                    >
                      {col.label}
                    </Checkbox>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && <div className="grp-empty">{messages.emptySearch}</div>}
        </div>

        <div className="cfg-right">
          <div className="sel-header">{messages.selectedCount(selectedCount, maxSelectCount)}</div>
          <div className="sel-list">
            {selectedColumns.length === 0 && (
              <div className="grp-empty">{messages.emptySelected}</div>
            )}
            {selectedColumns.map((col, index) => {
              const fixedCount = selectedColumns.filter((c) => c.fixed).length;
              const canUp = !col.fixed && index > fixedCount;
              const canDown = !col.fixed && index < selectedColumns.length - 1;
              return (
                <div
                  key={col.property}
                  className="sel-item"
                >
                  <span className="sel-label">
                    {col.label}
                    {col.fixed ? ` (${messages.fixedColumnsTip})` : ''}
                  </span>
                  {!col.fixed && (
                    <span className="sel-actions">
                      <Button
                        type="link"
                        size="small"
                        disabled={!canUp}
                        onClick={() => moveSelected(col.property, -1)}
                      >
                        {messages.moveUp}
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        disabled={!canDown}
                        onClick={() => moveSelected(col.property, 1)}
                      >
                        {messages.moveDown}
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => toggleColumn(col.property, false)}
                      >
                        ×
                      </Button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
