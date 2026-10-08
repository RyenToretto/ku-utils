/**
 * Part 4: clazz, club, uiKit, doFilter, customColumns, nestMenus, example shell
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

function crudList({ name, title, nameField, apiList, apiDelete, apiEdit }) {
  return `import { Button, Form, Input, Space, message } from 'antd';
import { useMemo, useState } from 'react';
import DoFilterPanel from '@/components/DoFilterPanel';
import TableWrap from '@/components/TableWrap';
import { useTableQuery } from '@/composables/useTableQuery';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { ${apiList}, ${apiDelete}, ${apiEdit} } from '../_api/${name}';

type Row = Record<string, unknown> & { id: string | number; ${nameField}?: string };

export default function ${title}List() {
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [form] = Form.useForm();
  const maxHeight = useAdminTableMaxHeight();
  const { listFilters, setFilters, tableData, tableTotal, tableLoading, pageNum, pageSize, search, onPageChange } =
    useTableQuery<Row, { keyword: string }>({
      defaultFilters: { keyword: '' },
      fetcher: async (query, signal) => ${apiList}({ ...query, ${nameField}: query.keyword }, signal) as any,
    });
  const columns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '${title}', dataIndex: '${nameField}', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 100 },
    {
      title: '操作', key: 'op', width: 140,
      render: (_: unknown, row: Row) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditRow(row); form.setFieldsValue(row); setEditOpen(true); }}>编辑</Button>
          <Button type="link" size="small" danger onClick={async () => { await ${apiDelete}({ id: row.id }); message.success('已删除'); void search(false); }}>删除</Button>
        </Space>
      ),
    },
  ], [form, search]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
      <DoFilterPanel loading={tableLoading} onSearch={() => void search(true)}>
        <Form layout="inline">
          <Form.Item label="${title}">
            <Input allowClear placeholder="不限" value={listFilters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
              onPressEnter={() => void search(true)} />
          </Form.Item>
        </Form>
      </DoFilterPanel>
      <div><Button type="primary" onClick={() => { setEditRow(null); form.resetFields(); setEditOpen(true); }}>新建${title}</Button></div>
      <TableWrap rowKey="id" loading={tableLoading} columns={columns} dataSource={tableData} maxHeight={maxHeight}
        pagination={{ current: pageNum, pageSize, total: tableTotal, onChange: onPageChange }} />
      <ModalEdit open={editOpen} form={form} title={editRow ? '编辑${title}' : '新建${title}'}
        onClose={() => setEditOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          await ${apiEdit}({ ...editRow, ...values });
          message.success('保存成功');
          setEditOpen(false);
          void search(true);
        }} />
    </div>
  );
}

import { Form as AntForm, Input as AntInput, Modal } from 'antd';
function ModalEdit({ open, form, title, onClose, onOk }: any) {
  return (
    <Modal title={title} open={open} onCancel={onClose} onOk={onOk} destroyOnClose>
      <AntForm form={form} layout="vertical">
        <AntForm.Item name="${nameField}" label="${title}" rules={[{ required: true, message: '请输入' }]}>
          <AntInput placeholder="请输入" />
        </AntForm.Item>
      </AntForm>
    </Modal>
  );
}
`;
}

write(
  'modules/_example/clazzManage/_module/ClazzManageList.tsx',
  crudList({
    name: 'clazzManage',
    title: '班级',
    nameField: 'clazzName',
    apiList: 'requestClazzManageList',
    apiDelete: 'requestDeleteClazzManage',
    apiEdit: 'requestEditClazzManage',
  }),
);
write(
  'modules/_example/clazzManage/ClazzManageLayer.tsx',
  `import ClazzManageList from './_module/ClazzManageList';
export default function ClazzManageLayer() { return <ClazzManageList />; }
`,
);
write(
  'modules/_example/clazzManage/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
export default [{ path: 'clazz/list', Component: lazy(() => import('../ClazzManageLayer')), handle: { title: '班级管理', permission: 'EXAMPLE_MODULE' } }] satisfies RouteObject[];
`,
);

write(
  'modules/_example/clubActivity/_module/ClubActivityList.tsx',
  crudList({
    name: 'clubActivity',
    title: '社团',
    nameField: 'clubName',
    apiList: 'requestClubActivityList',
    apiDelete: 'requestDeleteClubActivity',
    apiEdit: 'requestEditClubActivity',
  })
    .replace(/班级/g, '社团')
    .replace(/clazzName/g, 'clubName'),
);
// fix the botched replace - rewrite club properly
write(
  'modules/_example/clubActivity/_module/ClubActivityList.tsx',
  crudList({
    name: 'clubActivity',
    title: '社团',
    nameField: 'clubName',
    apiList: 'requestClubActivityList',
    apiDelete: 'requestDeleteClubActivity',
    apiEdit: 'requestEditClubActivity',
  }),
);
write(
  'modules/_example/clubActivity/ClubActivityLayer.tsx',
  `import ClubActivityList from './_module/ClubActivityList';
export default function ClubActivityLayer() { return <ClubActivityList />; }
`,
);
write(
  'modules/_example/clubActivity/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
export default [{ path: 'club/list', Component: lazy(() => import('../ClubActivityLayer')), handle: { title: '社团活动', permission: 'EXAMPLE_MODULE' } }] satisfies RouteObject[];
`,
);

// uiKit demos
const uiKits = [
  ['panel', '筛选 / 表格 / 分页'],
  ['cells', '单元格与编辑器'],
  ['max-height', '表格 max-height'],
  ['name-pattern', '命名模板'],
  ['selector', 'DoSelector'],
  ['words-tag', 'WordsTag'],
  ['preview-video', '预览视频'],
  ['schedule-week', '投放时段周'],
];

for (const [slug, title] of uiKits) {
  const comp = slug
    .split('-')
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
  write(
    `modules/_example/uiKit/_module/UiKit${comp}Demo.tsx`,
    `import { Card, Typography, Table, Tag, Input, Select, DatePicker } from 'antd';
import SimpleExampleList from '../../simpleExample/_module/SimpleExampleList';

export default function UiKit${comp}Demo() {
  ${
    slug === 'panel' || slug === 'max-height'
      ? `return <SimpleExampleList fillViewportLayout />;`
      : `return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card size="small" title="${title}">
        <Typography.Paragraph>${title} Demo（kr-admin）</Typography.Paragraph>
        ${
          slug === 'cells'
            ? `<Table size="small" pagination={false} dataSource={[{ id: 1, name: '示例', status: '启用' }]} columns={[
          { title: '名称', dataIndex: 'name' },
          { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color="processing">{v}</Tag> },
          { title: 'DateRange', key: 'dr', render: () => <DatePicker.RangePicker /> },
        ]} rowKey="id" />`
            : slug === 'selector'
              ? `<Select style={{ width: 240 }} placeholder="请选择" options={[{ label: '选项A', value: 'a' }, { label: '选项B', value: 'b' }]} />`
              : slug === 'words-tag'
                ? `<Tag>WordsTag</Tag> <Tag color="blue">字数限制示例</Tag>`
                : slug === 'preview-video'
                  ? `<video controls style={{ maxWidth: 420 }} src="https://www.w3schools.com/html/mov_bbb.mp4" />`
                  : slug === 'schedule-week'
                    ? `<Typography.Text>投放时段周 Demo</Typography.Text>`
                    : slug === 'name-pattern'
                      ? `<Input placeholder="命名模板 {name}-{date}" />`
                      : `<Typography.Text>${title}</Typography.Text>`
        }
      </Card>
    </div>
  );`
  }
}
`,
  );
}

write(
  'modules/_example/uiKit/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
const uiKitRoutes: RouteObject[] = [
  { path: 'ui-kit/panel', Component: lazy(() => import('../_module/UiKitPanelDemo')), handle: { title: '筛选 / 表格 / 分页', permission: 'EXAMPLE_MODULE' } },
  { path: 'ui-kit/cells', Component: lazy(() => import('../_module/UiKitCellsDemo')), handle: { title: '单元格与编辑器', permission: 'EXAMPLE_MODULE' } },
  { path: 'ui-kit/max-height', Component: lazy(() => import('../_module/UiKitMaxHeightDemo')), handle: { title: '表格 max-height', permission: 'EXAMPLE_MODULE' } },
  { path: 'ui-kit/name-pattern', Component: lazy(() => import('../_module/UiKitNamePatternDemo')), handle: { title: '命名模板', permission: 'EXAMPLE_MODULE' } },
  { path: 'ui-kit/selector', Component: lazy(() => import('../_module/UiKitDoSelectorDemo')), handle: { title: 'DoSelector', permission: 'EXAMPLE_MODULE' } },
  { path: 'ui-kit/words-tag', Component: lazy(() => import('../_module/UiKitWordsTagDemo')), handle: { title: 'WordsTag', permission: 'EXAMPLE_MODULE' } },
  { path: 'ui-kit/preview-video', Component: lazy(() => import('../_module/UiKitPreviewVideoDemo')), handle: { title: '预览视频', permission: 'EXAMPLE_MODULE' } },
  { path: 'ui-kit/schedule-week', Component: lazy(() => import('../_module/UiKitScheduleWeekDemo')), handle: { title: '投放时段周', permission: 'EXAMPLE_MODULE' } },
];
export default uiKitRoutes;
`,
);

// doFilterPanel
write(
  'modules/_example/doFilterPanel/_module/DoFilterPanelScenarioDemo.tsx',
  `import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import SimpleExampleList from '../../simpleExample/_module/SimpleExampleList';
import type { DoFilterPanelDemoScenario } from '../_utils/doFilterPanelDemo';

const SCENARIO_BY_PATH: Record<string, DoFilterPanelDemoScenario> = {
  '/example/do-filter-panel/buttons-1': { buttonCount: 1, filterCount: 6, line: 2 },
  '/example/do-filter-panel/buttons-2': { buttonCount: 2, filterCount: 50, line: 2 },
  '/example/do-filter-panel/buttons-3': { buttonCount: 3, filterCount: 51, line: 2 },
  '/example/do-filter-panel/buttons-4': { buttonCount: 4, filterCount: 52, line: 2 },
  '/example/do-filter-panel/rows-1': { buttonCount: 2, filterCount: 3, line: 1 },
  '/example/do-filter-panel/rows-2': { buttonCount: 2, filterCount: 8, line: 2 },
  '/example/do-filter-panel/rows-3': { buttonCount: 2, filterCount: 14, line: 2 },
  '/example/do-filter-panel/rows-50': { buttonCount: 2, filterCount: 50, line: 2 },
  '/example/do-filter-panel/layout-fold': { buttonCount: 2, filterCount: 50, line: 2, fillViewportLayout: true },
};

export default function DoFilterPanelScenarioDemo() {
  const loc = useLocation();
  const scenario = SCENARIO_BY_PATH[loc.pathname] || { buttonCount: 2, filterCount: 6, line: 2 };
  const demoFields = useMemo(
    () =>
      Array.from({ length: scenario.filterCount }, (_, i) => ({
        key: \`f\${i + 1}\`,
        kind: (i % 3 === 0 ? 'input' : i % 3 === 1 ? 'select' : 'radio') as 'input' | 'select' | 'radio',
      })),
    [scenario.filterCount],
  );
  return (
    <SimpleExampleList
      fillViewportLayout={Boolean(scenario.fillViewportLayout)}
      filterLine={scenario.line}
      demoFields={demoFields}
    />
  );
}
`,
);

const filterPaths = [
  ['buttons-1', '按钮×1'],
  ['buttons-2', '按钮×2'],
  ['buttons-3', '按钮×3'],
  ['buttons-4', '按钮×4'],
  ['rows-1', '行数·少'],
  ['rows-2', '行数·中'],
  ['rows-3', '行数·多'],
  ['rows-50', '行数·50项'],
  ['layout-fold', '布局折叠压表格'],
];
write(
  'modules/_example/doFilterPanel/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
const Demo = lazy(() => import('../_module/DoFilterPanelScenarioDemo'));
const doFilterPanelRoutes: RouteObject[] = [
${filterPaths
  .map(
    ([p, t]) =>
      `  { path: 'do-filter-panel/${p}', Component: Demo, handle: { title: '${t}', permission: 'EXAMPLE_MODULE' } },`,
  )
  .join('\n')}
];
export default doFilterPanelRoutes;
`,
);

// custom columns shared demo
write(
  'modules/_example/customColumns/_module/CustomColumnsDemo.tsx',
  `import { Table } from 'antd';
import {
  useSchemaColumnConfig,
  DoTableHeader,
  DoConfigColumnDialog,
  schemasToColumns,
  type ColumnSchema,
} from '@ku-utils/r-custom-columns';

const BASE_SCHEMAS: ColumnSchema[] = [
  { prop: 'id', label: 'ID', width: 80, fixed: 'left', isDefault: true },
  { prop: 'name', label: '名称', isDefault: true, showOverflowTooltip: true },
  { prop: 'groupA', label: '分组A', group: '指标', isDefault: true },
  { prop: 'groupB', label: '分组B', group: '指标' },
  { prop: 'amount', label: '金额', align: 'right', isDefault: true },
  { prop: 'rate', label: '比率', align: 'right' },
  { prop: 'status', label: '状态', isDefault: true },
  { prop: 'remark', label: '备注' },
];

const NESTED: ColumnSchema[] = [
  { prop: 'id', label: 'ID', width: 80, isDefault: true },
  {
    label: '嵌套表头',
    children: [
      { prop: 'name', label: '名称', isDefault: true },
      { prop: 'amount', label: '金额', isDefault: true },
    ],
  },
];

const DATA = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: \`示例 \${i + 1}\`,
  groupA: 10 + i,
  groupB: 20 + i,
  amount: 1000 * (i + 1),
  rate: \`\${(i + 1) * 3}%\`,
  status: i % 2 ? '启用' : '停用',
  remark: '备注',
}));

export default function CustomColumnsDemo({
  title,
  mode = 'basic',
}: {
  title: string;
  mode?: 'basic' | 'nested' | 'fixed' | 'version' | 'slots';
}) {
  const schemas =
    mode === 'nested'
      ? NESTED
      : mode === 'fixed'
        ? BASE_SCHEMAS.map((s) => (s.prop === 'name' ? { ...s, fixed: 'left' as const } : s))
        : BASE_SCHEMAS;

  const {
    visibleSchemas,
    openConfig,
    closeConfig,
    configVisible,
    messages,
    applyConfig,
    resetConfig,
    configurableLeaves,
    activeColumns,
    maxSelectCount,
    tableRenderKey,
  } = useSchemaColumnConfig({
    columnSchemas: schemas,
    storageKey: \`kr_cc_\${mode}\`,
    schemaVersion: mode === 'version' ? 2 : 1,
  });

  const columns = schemasToColumns(visibleSchemas);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <DoTableHeader messages={messages} onOpen={openConfig} />
      <div style={{ opacity: 0.65, fontSize: 12 }}>{title} · 自定义列 Demo</div>
      <Table key={tableRenderKey} size="middle" rowKey="id" columns={columns} dataSource={DATA} pagination={false} scroll={{ x: true }} />
      <DoConfigColumnDialog
        open={configVisible}
        onClose={closeConfig}
        leaves={configurableLeaves}
        activeColumns={activeColumns}
        messages={messages}
        maxSelectCount={maxSelectCount}
        defaultConfigLabel={messages.defaultConfigLabel}
        onApply={applyConfig}
        onReset={resetConfig}
      />
    </div>
  );
}
`,
);

const ccPages = [
  ['01Basic/BasicColumns', 'basic', '01 基础用法'],
  ['02ElAttrs/ElAttrsColumns', 'basic', '02 elAttrs 属性透传'],
  ['03Slots/SlotsColumns', 'slots', '03 自定义 Slot'],
  ['04Nested/NestedColumns', 'nested', '04 嵌套表头'],
  ['05Version/VersionColumns', 'version', '05 版本管理'],
  ['06SlotComponents/SlotComponents', 'slots', '06 单元格三种写法'],
  ['07HeaderSlots/HeaderSlots', 'slots', '07 表头三种写法'],
  ['08FixedCols/FixedCols', 'fixed', '08 固定列 schema.fixed'],
];
for (const [file, mode, title] of ccPages) {
  write(
    `modules/_example/customColumns/_module/${file}.tsx`,
    `import CustomColumnsDemo from '../CustomColumnsDemo';
export default function Page() {
  return <CustomColumnsDemo title="${title}" mode="${mode}" />;
}
`,
  );
}

write(
  'modules/_example/customColumns/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
const customColumnsRoutes: RouteObject[] = [
  { path: 'custom-columns/basic', Component: lazy(() => import('../_module/01Basic/BasicColumns')), handle: { title: '01 基础用法', permission: 'EXAMPLE_MODULE' } },
  { path: 'custom-columns/el-attrs', Component: lazy(() => import('../_module/02ElAttrs/ElAttrsColumns')), handle: { title: '02 elAttrs 属性透传', permission: 'EXAMPLE_MODULE' } },
  { path: 'custom-columns/slots', Component: lazy(() => import('../_module/03Slots/SlotsColumns')), handle: { title: '03 自定义 Slot', permission: 'EXAMPLE_MODULE' } },
  { path: 'custom-columns/nested', Component: lazy(() => import('../_module/04Nested/NestedColumns')), handle: { title: '04 嵌套表头', permission: 'EXAMPLE_MODULE' } },
  { path: 'custom-columns/version', Component: lazy(() => import('../_module/05Version/VersionColumns')), handle: { title: '05 版本管理', permission: 'EXAMPLE_MODULE' } },
  { path: 'custom-columns/slot-components', Component: lazy(() => import('../_module/06SlotComponents/SlotComponents')), handle: { title: '06 单元格三种写法', permission: 'EXAMPLE_MODULE' } },
  { path: 'custom-columns/header-slots', Component: lazy(() => import('../_module/07HeaderSlots/HeaderSlots')), handle: { title: '07 表头三种写法', permission: 'EXAMPLE_MODULE' } },
  { path: 'custom-columns/fixed-cols', Component: lazy(() => import('../_module/08FixedCols/FixedCols')), handle: { title: '08 固定列 schema.fixed', permission: 'EXAMPLE_MODULE' } },
];
export default customColumnsRoutes;
`,
);

write(
  'modules/_example/nestMenus/NestMenusLayer.tsx',
  `import { Breadcrumb, Card, Typography } from 'antd';
import { useLocation } from 'react-router-dom';

const TRAILS: Record<string, string[]> = {
  '/example/nest-menus/a1/page-alpha': ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A1', '四级 · Alpha'],
  '/example/nest-menus/a1/page-beta': ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A1', '四级 · Beta'],
  '/example/nest-menus/a2/page-gamma': ['一级 · 多级导航', '二级 · 业务 A', '三级 · 场景 A2', '四级 · Gamma'],
  '/example/nest-menus/b1/page-delta': ['一级 · 多级导航', '二级 · 业务 B', '三级 · 场景 B1', '四级 · Delta'],
};

export default function NestMenusLayer() {
  const loc = useLocation();
  const trail = TRAILS[loc.pathname] || ['多级导航'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Breadcrumb items={trail.map((t) => ({ title: t }))} />
      <Card size="small">
        <Typography.Title level={5}>{trail[trail.length - 1]}</Typography.Title>
        <Typography.Paragraph>四级导航页（kr-admin）</Typography.Paragraph>
      </Card>
    </div>
  );
}
`,
);

write(
  'modules/_example/nestMenus/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
const Layer = lazy(() => import('../NestMenusLayer'));
const nestMenusRoutes: RouteObject[] = [
  { path: 'nest-menus/a1/page-alpha', Component: Layer, handle: { title: '四级 · Alpha', permission: 'EXAMPLE_MODULE' } },
  { path: 'nest-menus/a1/page-beta', Component: Layer, handle: { title: '四级 · Beta', permission: 'EXAMPLE_MODULE' } },
  { path: 'nest-menus/a2/page-gamma', Component: Layer, handle: { title: '四级 · Gamma', permission: 'EXAMPLE_MODULE' } },
  { path: 'nest-menus/b1/page-delta', Component: Layer, handle: { title: '四级 · Delta', permission: 'EXAMPLE_MODULE' } },
];
export default nestMenusRoutes;
`,
);

write(
  'modules/_example/index.tsx',
  `import {
  AppstoreOutlined,
  FilterOutlined,
  MenuOutlined,
  ShareAltOutlined,
  TableOutlined,
} from '@ant-design/icons';
import DomainModuleShell from '@/layouts/DomainModuleShell';
import type { SideMenuNode } from '@/layouts/sideMenu';

const menus: SideMenuNode[] = [
  {
    path: '/example/simple',
    title: '示例管理',
    icon: <AppstoreOutlined />,
    children: [
      '/example/simple/list',
      '/example/simple/batch-select',
      '/example/school/list',
      '/example/school-selector/demo',
      '/example/clazz/list',
      '/example/club/list',
    ],
  },
  {
    path: '/example/ui-kit',
    title: '基础组件',
    icon: <TableOutlined />,
    children: [
      '/example/ui-kit/panel',
      '/example/ui-kit/cells',
      '/example/ui-kit/max-height',
      '/example/ui-kit/name-pattern',
      '/example/ui-kit/selector',
      '/example/ui-kit/words-tag',
      '/example/ui-kit/preview-video',
      '/example/ui-kit/schedule-week',
    ],
  },
  {
    path: '/example/do-filter-panel',
    title: '筛选面板',
    icon: <FilterOutlined />,
    children: [
      '/example/do-filter-panel/buttons-1',
      '/example/do-filter-panel/buttons-2',
      '/example/do-filter-panel/buttons-3',
      '/example/do-filter-panel/buttons-4',
      '/example/do-filter-panel/rows-1',
      '/example/do-filter-panel/rows-2',
      '/example/do-filter-panel/rows-3',
      '/example/do-filter-panel/rows-50',
      '/example/do-filter-panel/layout-fold',
    ],
  },
  {
    path: '/example/custom-columns',
    title: '自定义列',
    icon: <MenuOutlined />,
    children: [
      '/example/custom-columns/basic',
      '/example/custom-columns/el-attrs',
      '/example/custom-columns/slots',
      '/example/custom-columns/nested',
      '/example/custom-columns/version',
      '/example/custom-columns/slot-components',
      '/example/custom-columns/header-slots',
      '/example/custom-columns/fixed-cols',
    ],
  },
  {
    path: '/example/nest-menus',
    title: '多级导航示例',
    icon: <ShareAltOutlined />,
    children: [
      {
        path: '/example/nest-menus/a',
        title: '二级 · 业务 A',
        children: [
          {
            path: '/example/nest-menus/a1',
            title: '三级 · 场景 A1',
            children: ['/example/nest-menus/a1/page-alpha', '/example/nest-menus/a1/page-beta'],
          },
          {
            path: '/example/nest-menus/a2',
            title: '三级 · 场景 A2',
            children: ['/example/nest-menus/a2/page-gamma'],
          },
        ],
      },
      {
        path: '/example/nest-menus/b',
        title: '二级 · 业务 B',
        children: [
          {
            path: '/example/nest-menus/b1',
            title: '三级 · 场景 B1',
            children: ['/example/nest-menus/b1/page-delta'],
          },
        ],
      },
    ],
  },
];

export default function ExampleModule() {
  return <DomainModuleShell menus={menus} moduleRootPath="/example" />;
}
`,
);

write(
  'modules/_example/_router/index.tsx',
  `import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import clazzManage from '@/modules/_example/clazzManage/_router';
import clubActivity from '@/modules/_example/clubActivity/_router';
import customColumns from '@/modules/_example/customColumns/_router';
import doFilterPanel from '@/modules/_example/doFilterPanel/_router';
import nestMenus from '@/modules/_example/nestMenus/_router';
import schoolResource from '@/modules/_example/schoolResource/_router';
import schoolSelector from '@/modules/_example/schoolSelector/_router';
import simpleExample from '@/modules/_example/simpleExample/_router';
import uiKit from '@/modules/_example/uiKit/_router';

const exampleRoutes: RouteObject[] = [
  {
    path: 'example',
    Component: lazy(() => import('@/modules/_example/index')),
    handle: { isHeaderTab: true, permission: 'EXAMPLE_MODULE' },
    children: [
      ...simpleExample,
      ...schoolResource,
      ...schoolSelector,
      ...clazzManage,
      ...clubActivity,
      ...uiKit,
      ...doFilterPanel,
      ...customColumns,
      ...nestMenus,
      { index: true, Component: lazy(() => import('@/modules/_example/simpleExample/SimpleExampleLayer')) },
    ],
  },
];

export default exampleRoutes;
`,
);

console.log('part4 done');
