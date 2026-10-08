import { SyncOutlined } from '@ant-design/icons';
import { Button, Input, Pagination, Select } from 'antd';
import { useState } from 'react';

export type ListPaginationBarProps = {
  pageNum: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  pageSizeOptions?: string[];
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  /** 传入即显示刷新按钮（对齐 kv3 BasePagination enable-refresh） */
  onRefresh?: () => void;
};

type JumperProps = {
  current: number;
  pageCount: number;
  onJump: (page: number) => void;
};

/** el-pagination jumper：始终显示当前页，失焦/回车时钳到 [1, pageCount] 再跳 */
function PaginationJumper({ current, pageCount, onJump }: JumperProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const n = Number.parseInt(draft, 10);
    const next = Number.isNaN(n) || n < 1 ? 1 : Math.min(n, pageCount);
    setDraft(null);
    if (next !== current) onJump(next);
  };

  return (
    <span className="do-pagination-jump">
      前往
      <Input
        inputMode="numeric"
        aria-label="页码"
        value={draft ?? String(current)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={commit}
        onPressEnter={commit}
      />
      页
    </span>
  );
}

/** 列表底部分页条：对齐 kv3 BasePagination（refresh, total, prev, pager, next, jumper, sizes） */
export function ListPaginationBar({
  pageNum,
  pageSize,
  total,
  loading = false,
  pageSizeOptions = ['10', '20', '50'],
  onPageChange,
  onSizeChange,
  onRefresh,
}: ListPaginationBarProps) {
  const showPager = total > 0;
  if (!showPager && !onRefresh) return null;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div
      className="table-pagination-bar"
      role="navigation"
      aria-label="分页导航"
    >
      {onRefresh ? (
        <Button
          className="do-pagination-refresh"
          icon={<SyncOutlined />}
          loading={loading}
          aria-label="刷新"
          title="刷新"
          onClick={onRefresh}
        />
      ) : null}
      {showPager ? (
        <>
          <Pagination
            current={pageNum}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            showTotal={(t) => `共 ${t} 条`}
            onChange={onPageChange}
          />
          <PaginationJumper
            current={pageNum}
            pageCount={pageCount}
            onJump={onPageChange}
          />
          <Select
            className="do-pagination-sizes"
            aria-label="每页条数"
            value={pageSize}
            options={pageSizeOptions.map((s) => ({ value: Number(s), label: `${s}条/页` }))}
            onChange={onSizeChange}
          />
        </>
      ) : null}
    </div>
  );
}

export default ListPaginationBar;
