import { Alert, Card } from 'antd';
import { useMemo, useState } from 'react';

import { DoSelector } from '@/components/DoSelector';

const cityOptions = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '深圳', value: 'sz' },
];

export default function UiKitDoSelectorDemo() {
  const [staticValue, setStaticValue] = useState<string | number | null>(null);
  const [remoteValue, setRemoteValue] = useState<string | number | null>(null);
  const [remoteLabel, setRemoteLabel] = useState('');

  const remotePayload = useMemo(
    () => ({
      keyword: 'demo',
      requestFunc: async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return [
          { label: '北京', value: 'bj' },
          { label: '上海', value: 'sh' },
          { label: '深圳', value: 'sz' },
        ];
      },
    }),
    [],
  );

  return (
    <div className="page-ui-kit-do-selector">
      <Alert
        type="warning"
        showIcon
        closable={false}
        message="DoSelector 适合简单枚举 / 远程下拉；跨域选实体请用 XxxSelector。"
      />

      <Card
        size="small"
        className="ui-kit-demo-card"
      >
        <h3>静态 options</h3>
        <DoSelector
          value={staticValue}
          clearable
          style={{ width: 220 }}
          options={cityOptions}
          placeholder="请选择"
          onChange={(v) => setStaticValue(Array.isArray(v) ? (v[0] ?? null) : v)}
        />
        <p className="ui-kit-demo-hint">{staticValue || '—'}</p>
      </Card>

      <Card
        size="small"
        className="ui-kit-demo-card"
      >
        <h3>远程 payload</h3>
        <DoSelector
          value={remoteValue}
          clearable
          style={{ width: 220 }}
          payload={remotePayload}
          placeholder="请选择"
          onChange={(v) => setRemoteValue(Array.isArray(v) ? (v[0] ?? null) : v)}
          onSelectChange={(opt) => {
            const one = Array.isArray(opt) ? opt[0] : opt;
            setRemoteLabel(one?.label || '');
          }}
        />
        <p className="ui-kit-demo-hint">
          {remoteValue || '—'}
          {remoteLabel ? ` / ${remoteLabel}` : ''}
        </p>
      </Card>
    </div>
  );
}
