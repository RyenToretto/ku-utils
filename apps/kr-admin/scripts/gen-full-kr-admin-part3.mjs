/**
 * Part 3: all routers (tsx) + remaining domain pages + example index
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
function write(rel, content) {
  const full = path.join(SRC, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log(rel);
}

const demoPage = (title, extra = '') => `import { Card, Typography } from 'antd';

export default function DemoPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card size="small">
        <Typography.Title level={5} style={{ margin: 0 }}>${title}</Typography.Title>
        <Typography.Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
          ${extra || title}（kr-admin / Ant Design 同形 Demo）
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
`;

// Layers
write(
  'modules/_example/simpleExample/SimpleExampleLayer.tsx',
  `import SimpleExampleList from './_module/SimpleExampleList';
export default function SimpleExampleLayer() {
  return <SimpleExampleList />;
}
`,
);

write(
  'modules/_example/simpleExample/SimpleExampleBatchSelectLayer.tsx',
  `import { Button, Space, message } from 'antd';
import { useState } from 'react';
import SimpleExampleList from './_module/SimpleExampleList';
import { requestBatchSimpleExample } from './_api/simpleExample';

export default function SimpleExampleBatchSelectLayer() {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <Space>
        <span>表外全选（#batch）已选 {selected.length} 项</span>
        <Button
          disabled={!selected.length}
          onClick={async () => {
            await requestBatchSimpleExample(selected, 1);
            message.success('批量启用成功');
          }}
        >
          批量启用
        </Button>
      </Space>
      <SimpleExampleList />
    </div>
  );
}
`,
);

write(
  'modules/_example/simpleExample/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const simpleExampleRoutes: RouteObject[] = [
  {
    path: 'simple/list',
    Component: lazy(() => import('../SimpleExampleLayer')),
    handle: { title: '示例管理', permission: 'EXAMPLE_MODULE' },
  },
  {
    path: 'simple/batch-select',
    Component: lazy(() => import('../SimpleExampleBatchSelectLayer')),
    handle: { title: '表外全选（#batch）', permission: 'EXAMPLE_MODULE' },
  },
];
export default simpleExampleRoutes;
`,
);

// School
write(
  'modules/_example/schoolResource/_module/SchoolResourceList.tsx',
  `import { Button, Form, Input, Space, message } from 'antd';
import { useMemo, useState } from 'react';
import DoFilterPanel from '@/components/DoFilterPanel';
import TableWrap from '@/components/TableWrap';
import { useTableQuery } from '@/composables/useTableQuery';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { requestSchoolResourceList, requestDeleteSchoolResource } from '../_api/schoolResource';
import DialogEditSchoolResource from './DialogEditSchoolResource';

type Row = Record<string, unknown> & { id: string | number; schoolName?: string };

export default function SchoolResourceList({
  mode = 'page',
  onPick,
}: {
  mode?: 'page' | 'selector';
  onPick?: (rows: Row[]) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const maxHeight = useAdminTableMaxHeight();
  const { listFilters, setFilters, tableData, tableTotal, tableLoading, pageNum, pageSize, search, onPageChange } =
    useTableQuery<Row, { schoolName: string }>({
      defaultFilters: { schoolName: '' },
      fetcher: async (query) => requestSchoolResourceList(query) as Promise<{ data: { lists: Row[]; total: number } }>,
    });

  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 80 },
      { title: '学校名称', dataIndex: 'schoolName', ellipsis: true },
      { title: '状态', dataIndex: 'status', width: 100 },
      mode === 'page'
        ? {
            title: '操作',
            key: 'op',
            width: 140,
            render: (_: unknown, row: Row) => (
              <Space>
                <Button type="link" size="small" onClick={() => { setEditRow(row); setEditOpen(true); }}>编辑</Button>
                <Button type="link" size="small" danger onClick={async () => {
                  await requestDeleteSchoolResource({ id: row.id });
                  message.success('已删除');
                  void search(false);
                }}>删除</Button>
              </Space>
            ),
          }
        : null,
    ].filter(Boolean) as any[],
    [mode, search],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
      <DoFilterPanel loading={tableLoading} onSearch={() => void search(true)}>
        <Form layout="inline">
          <Form.Item label="学校名称">
            <Input
              allowClear
              placeholder="不限"
              value={listFilters.schoolName}
              onChange={(e) => setFilters((f) => ({ ...f, schoolName: e.target.value }))}
              onPressEnter={() => void search(true)}
            />
          </Form.Item>
        </Form>
      </DoFilterPanel>
      {mode === 'page' ? (
        <div><Button type="primary" onClick={() => { setEditRow(null); setEditOpen(true); }}>新建学校</Button></div>
      ) : (
        <div>
          <Button type="primary" disabled={!selectedRowKeys.length} onClick={() => onPick?.(tableData.filter((r) => selectedRowKeys.includes(r.id as React.Key)))}>
            确认选择
          </Button>
        </div>
      )}
      <TableWrap
        rowKey="id"
        loading={tableLoading}
        columns={columns}
        dataSource={tableData}
        maxHeight={maxHeight}
        rowSelection={mode === 'selector' ? { selectedRowKeys, onChange: setSelectedRowKeys } : undefined}
        pagination={{ current: pageNum, pageSize, total: tableTotal, onChange: onPageChange }}
      />
      {mode === 'page' ? (
        <DialogEditSchoolResource open={editOpen} row={editRow} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); void search(true); }} />
      ) : null}
    </div>
  );
}
`,
);

write(
  'modules/_example/schoolResource/_module/DialogEditSchoolResource.tsx',
  `import { Form, Input, Modal, message } from 'antd';
import { useEffect } from 'react';
import { requestEditSchoolResource } from '../_api/schoolResource';

export default function DialogEditSchoolResource({ open, row, onClose, onSaved }: any) {
  const [form] = Form.useForm();
  useEffect(() => { if (open) form.setFieldsValue(row || { schoolName: '' }); }, [open, row, form]);
  return (
    <Modal title={row ? '编辑学校' : '新建学校'} open={open} onCancel={onClose} destroyOnClose
      onOk={async () => {
        const values = await form.validateFields();
        await requestEditSchoolResource({ ...row, ...values });
        message.success('保存成功');
        onSaved();
      }}>
      <Form form={form} layout="vertical">
        <Form.Item name="schoolName" label="学校名称" rules={[{ required: true, message: '请输入学校名称' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
`,
);

write(
  'modules/_example/schoolResource/_module/SchoolSelector.tsx',
  `import { Input } from 'antd';
import { useState } from 'react';
import DialogSelectSchoolResource from './DialogSelectSchoolResource';

export default function SchoolSelector({
  value,
  onChange,
}: {
  value?: { id?: string | number; schoolName?: string } | null;
  onChange?: (v: { id: string | number; schoolName?: string } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="school-selector">
      <Input
        readOnly
        placeholder="请选择学校"
        value={value?.schoolName || ''}
        onClick={() => setOpen(true)}
      />
      <DialogSelectSchoolResource
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(rows) => {
          const row = rows[0];
          onChange?.(row ? { id: row.id as string | number, schoolName: String(row.schoolName || '') } : null);
          setOpen(false);
        }}
      />
    </div>
  );
}
`,
);

write(
  'modules/_example/schoolResource/_module/DialogSelectSchoolResource.tsx',
  `import { Drawer } from 'antd';
import SchoolResourceList from './SchoolResourceList';

export default function DialogSelectSchoolResource({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (rows: Record<string, unknown>[]) => void;
}) {
  return (
    <Drawer title="选择学校" open={open} onClose={onClose} width={720} destroyOnClose>
      <SchoolResourceList mode="selector" onPick={onConfirm} />
    </Drawer>
  );
}
`,
);

write(
  'modules/_example/schoolResource/SchoolResourceLayer.tsx',
  `import SchoolResourceList from './_module/SchoolResourceList';
export default function SchoolResourceLayer() {
  return <SchoolResourceList mode="page" />;
}
`,
);

write(
  'modules/_example/schoolResource/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
const routes: RouteObject[] = [{
  path: 'school/list',
  Component: lazy(() => import('../SchoolResourceLayer')),
  handle: { title: '学校管理', permission: 'EXAMPLE_MODULE' },
}];
export default routes;
`,
);

write(
  'modules/_example/schoolSelector/_module/DialogEditSchoolSelectorDemo.tsx',
  `import { Form, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import SchoolSelector from '../../schoolResource/_module/SchoolSelector';

export default function DialogEditSchoolSelectorDemo({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [school, setSchool] = useState<{ id: string | number; schoolName?: string } | null>(null);
  useEffect(() => { if (open) setSchool(null); }, [open]);
  return (
    <Modal title="学校选择器 Demo" open={open} onCancel={onClose} onOk={() => { message.success(school ? \`已选择 \${school.schoolName}\` : '未选择'); onClose(); }} destroyOnClose>
      <Form layout="vertical">
        <Form.Item label="学校" required>
          <SchoolSelector value={school} onChange={setSchool} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
`,
);

write(
  'modules/_example/schoolSelector/SchoolSelectorDemoLayer.tsx',
  `import { Button, Card } from 'antd';
import { useState } from 'react';
import DialogEditSchoolSelectorDemo from './_module/DialogEditSchoolSelectorDemo';
import SchoolSelector from '../schoolResource/_module/SchoolSelector';

export default function SchoolSelectorDemoLayer() {
  const [open, setOpen] = useState(false);
  const [school, setSchool] = useState<{ id: string | number; schoolName?: string } | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card size="small" title="筛选区">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>学校选择</span>
          <div style={{ width: 280 }}><SchoolSelector value={school} onChange={setSchool} /></div>
          <Button type="primary" onClick={() => setOpen(true)}>弹层选择</Button>
        </div>
      </Card>
      <DialogEditSchoolSelectorDemo open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
`,
);

write(
  'modules/_example/schoolSelector/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
const routes: RouteObject[] = [{
  path: 'school-selector/demo',
  Component: lazy(() => import('../SchoolSelectorDemoLayer')),
  handle: { title: '学校选择器 Demo', permission: 'EXAMPLE_MODULE' },
}];
export default routes;
`,
);

console.log('school done');
