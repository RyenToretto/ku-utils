/**
 * Generate kr-admin React example modules + shell in one shot.
 * Run: node apps/kr-admin/scripts/scaffold-react-app.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../src');

function write(rel, content) {
  const full = path.join(SRC, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log('write', rel);
}

write(
  'vite-env.d.ts',
  `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PROJECT_NAME: string;
  readonly VITE_APP_PORT: string;
  readonly VITE_APP_PUBLIC_PATH: string;
  readonly VITE_APP_API_BASE_URL: string;
  readonly VITE_APP_API_PROXY: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_APP_USE_EXAMPLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@example-routes' {
  import type { RouteObject } from 'react-router-dom';
  const routes: RouteObject[];
  export default routes;
}

declare module '@example-maps' {
  const maps: Record<string, unknown>;
  export default maps;
}

declare module '@example-mocks' {
  const mocks: unknown;
  export default mocks;
}

declare module '@header-example-tab' {
  import type { ComponentType } from 'react';
  const Tab: ComponentType | null;
  export default Tab;
}
`,
);

write(
  'assets/styles/antd-ku-bridge.scss',
  `:root {
  --ant-color-primary: var(--ku-color-primary, #9a6328);
  --ant-color-success: var(--ku-color-success, #52c41a);
  --ant-color-warning: var(--ku-color-warning, #faad14);
  --ant-color-error: var(--ku-color-danger, #ff4d4f);
  --ant-color-info: var(--ku-color-primary, #9a6328);
  --ant-border-radius: var(--ku-radius-md, 6px);
  --ant-color-bg-container: var(--ku-bg-elevated, #fff);
  --ant-color-bg-layout: var(--ku-bg-page, #f4eee1);
  --ant-color-text: var(--ku-text-primary, #4e4540);
  --ant-color-text-secondary: var(--ku-text-secondary, #8a7f76);
  --ant-color-border: var(--ku-border-color, #e5e0d8);
}

html.dark {
  --ant-color-bg-container: var(--ku-bg-elevated, #1f2229);
  --ant-color-bg-layout: var(--ku-bg-page, #1a1c22);
  --ant-color-text: var(--ku-text-primary, #ede6da);
  --ant-color-text-secondary: var(--ku-text-secondary, #b8aea2);
  --ant-color-border: var(--ku-border-color, #3a3f4a);
}
`,
);

write(
  'components/DoFilterPanel.tsx',
  `import { Button, Space } from 'antd';
import type { ReactNode } from 'react';

export interface DoFilterPanelProps {
  children?: ReactNode;
  loading?: boolean;
  line?: number;
  onSearch?: () => void;
  onReset?: () => void;
  extraButtons?: ReactNode;
}

export default function DoFilterPanel({
  children,
  loading,
  onSearch,
  onReset,
  extraButtons,
}: DoFilterPanelProps) {
  return (
    <div className="do-filter-panel" style={{ marginBottom: 12 }}>
      <div className="do-filter-panel-body">{children}</div>
      <Space className="do-filter-panel-actions" style={{ marginTop: 8 }}>
        <Button type="primary" loading={loading} onClick={() => onSearch?.()}>
          搜索
        </Button>
        {onReset ? (
          <Button onClick={onReset} disabled={loading}>
            重置
          </Button>
        ) : null}
        {extraButtons}
      </Space>
    </div>
  );
}
`,
);

write(
  'components/TableWrap.tsx',
  `import { Table, type TableProps } from 'antd';
import type { ReactNode } from 'react';

export interface TableWrapProps<T extends object> extends TableProps<T> {
  toolbar?: ReactNode;
  maxHeight?: number;
}

export default function TableWrap<T extends object>({
  toolbar,
  maxHeight,
  scroll,
  pagination,
  ...rest
}: TableWrapProps<T>) {
  return (
    <div className="table-wrap">
      {toolbar}
      <Table<T>
        size="middle"
        scroll={{ y: maxHeight, ...(scroll || {}) }}
        pagination={
          pagination === false
            ? false
            : {
                showSizeChanger: true,
                showTotal: (total) => \`共 \${total} 条\`,
                ...(typeof pagination === 'object' ? pagination : {}),
              }
        }
        {...rest}
      />
    </div>
  );
}
`,
);

console.log('scaffold partial done');
