import { CheckOutlined, MinusOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';

import type { RowSelector, RowSelectorStatus } from '@/composables/useRowSelector';

/** 表头批量勾选框（全选 / 半选 / 未选） */
export function DoSelectBatchBox({
  status,
  onClick,
}: {
  status: RowSelectorStatus;
  onClick?: () => void;
}) {
  return (
    <div
      className={[
        'do-select-cell',
        'batch-select-box',
        status,
        status !== 'none-selected' ? 'active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      {status === 'all-selected' ? <CheckOutlined /> : null}
      {status === 'half-selected' ? <MinusOutlined /> : null}
    </div>
  );
}

/** 行勾选单元格：多选方框 / 单选圆点 */
export function DoSelectCell({
  active,
  single = false,
  transparent = false,
  onClick,
}: {
  active: boolean;
  single?: boolean;
  transparent?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={[
        'do-select-cell',
        active ? 'active' : '',
        single ? 'single' : '',
        transparent ? 'transparent' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <CheckOutlined />
    </div>
  );
}

/** 左固定勾选列；多选且 `batchHeader` 时表头放批量勾选框 */
export function createSelectColumn<T extends object>(
  selector: RowSelector<T>,
  { multiple = true, batchHeader = multiple }: { multiple?: boolean; batchHeader?: boolean } = {},
): ColumnType<T> {
  return {
    key: '__select__',
    width: 55,
    align: 'center',
    fixed: 'left',
    title: batchHeader ? (
      <DoSelectBatchBox
        status={selector.statusOfSelect}
        onClick={selector.toggleBatchSelect}
      />
    ) : null,
    render: (_, row) => (
      <DoSelectCell
        active={selector.isRowSelected(row)}
        single={!multiple}
        transparent={selector.isRowTransparent(row)}
        onClick={() => selector.chooseRow(row)}
      />
    ),
  };
}
