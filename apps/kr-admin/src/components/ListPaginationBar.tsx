import { ReloadOutlined } from '@ant-design/icons';
import { Button, Pagination } from 'antd';

export type ListPaginationBarProps = {
  pageNum: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  pageSizeOptions?: string[];
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onRefresh: () => void;
};

/** 列表底部分页条：刷新 + Pagination，对齐 kv3 BasePagination(enable-refresh)。 */
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
  return (
    <div className="table-pagination-bar">
      <Button
        type="text"
        size="small"
        icon={<ReloadOutlined spin={loading} />}
        aria-label="刷新"
        title="刷新"
        onClick={onRefresh}
      />
      <Pagination
        current={pageNum}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        showQuickJumper
        pageSizeOptions={pageSizeOptions}
        showTotal={(t) => `共 ${t} 条`}
        onChange={(page, size) => {
          if (size !== pageSize) onSizeChange(size);
          else onPageChange(page);
        }}
      />
    </div>
  );
}

export default ListPaginationBar;
