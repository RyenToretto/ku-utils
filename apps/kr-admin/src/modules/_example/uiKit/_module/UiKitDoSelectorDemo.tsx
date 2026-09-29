import { Card, Space, Typography } from 'antd';
import { useState } from 'react';

import { DoSelector } from '@/components/DoSelector';

const OPTIONS = [
  { value: 1, label: '选项甲' },
  { value: 2, label: '选项乙' },
  { value: 3, label: '选项丙' },
];

export default function UiKitDoSelectorDemo() {
  const [single, setSingle] = useState<string | number | null>(1);
  const [multi, setMulti] = useState<Array<string | number>>([1, 2]);
  return (
    <Card title="DoSelector">
      <Space
        direction="vertical"
        size="large"
      >
        <div>
          <Typography.Text type="secondary">单选</Typography.Text>
          <div>
            <DoSelector
              value={single}
              options={OPTIONS}
              onChange={(v) => setSingle(Array.isArray(v) ? (v[0] ?? null) : v)}
            />
          </div>
        </div>
        <div>
          <Typography.Text type="secondary">多选</Typography.Text>
          <div>
            <DoSelector
              multiple
              value={multi}
              options={OPTIONS}
              onChange={(v) => setMulti(Array.isArray(v) ? v : v != null ? [v] : [])}
            />
          </div>
        </div>
      </Space>
    </Card>
  );
}
