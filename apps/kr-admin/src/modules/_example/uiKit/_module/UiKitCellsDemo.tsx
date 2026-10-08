import { Card, Space } from 'antd';
import { useState } from 'react';

import CellDateTime from '@/components/CellDateTime';
import CellState from '@/components/CellState';
import DateRange from '@/components/DateRange';
import DoNumberSetter from '@/components/DoNumberSetter';
import { DoSelector } from '@/components/DoSelector';
import DoTxtSetter from '@/components/DoTxtSetter';
import { message } from '@/plugins/antdApp';

const sampleTime = '2026-08-06 19:43:02';
const cityOptions = [
  { value: 'bj', label: '北京' },
  { value: 'sh', label: '上海' },
  { value: 'gz', label: '广州' },
];

export default function UiKitCellsDemo() {
  const [switchValue, setSwitchValue] = useState(1);
  const [switching, setSwitching] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | []>([]);
  const [selectorValue, setSelectorValue] = useState<string | number | null>(null);
  const [score, setScore] = useState(88);
  const [title, setTitle] = useState('可编辑标题');

  async function onSwitch(next: string | number | boolean) {
    setSwitching(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setSwitchValue(Number(next));
      message.success(Number(next) === 1 ? '已启用' : '已停用');
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="page-ui-kit-cells">
      <Card
        size="small"
        title="CellState"
        className="demo-card"
      >
        <div className="demo-row">
          <CellState modelValue={1} />
          <CellState modelValue={0} />
          <CellState
            modelValue={switchValue}
            switchable
            switching={switching}
            onSwitch={(v) => void onSwitch(v)}
          />
        </div>
      </Card>

      <Card
        size="small"
        title="CellDateTime"
        className="demo-card"
      >
        <div className="demo-row demo-datetime">
          <div>
            <div className="demo-label">stacked</div>
            <CellDateTime value={sampleTime} />
          </div>
          <div>
            <div className="demo-label">compact</div>
            <CellDateTime
              layout="compact"
              value={sampleTime}
            />
          </div>
          <div>
            <div className="demo-label">with-actor</div>
            <CellDateTime
              layout="with-actor"
              value={sampleTime}
              actor="zhengwenwen"
            />
          </div>
          <div>
            <div className="demo-label">dateOnly</div>
            <CellDateTime
              dateOnly
              value={sampleTime}
            />
          </div>
          <div>
            <div className="demo-label">inline</div>
            <CellDateTime
              variant="inline"
              value={sampleTime}
            />
          </div>
        </div>
      </Card>

      <Card
        size="small"
        title="DateRange / DoSelector"
        className="demo-card"
      >
        <div className="demo-row">
          <DateRange
            value={dateRange}
            onChange={(v) => setDateRange(v)}
            style={{ width: 260 }}
          />
          <DoSelector
            value={selectorValue}
            options={cityOptions}
            style={{ width: 180 }}
            onChange={(v) => setSelectorValue(Array.isArray(v) ? (v[0] ?? null) : v)}
          />
          <span className="demo-hint">
            已选：{selectorValue || '—'} / {dateRange.length === 2 ? dateRange.join(' ~ ') : '—'}
          </span>
        </div>
      </Card>

      <Card
        size="small"
        title="DoNumberSetter / DoTxtSetter"
        className="demo-card"
      >
        <Space
          className="demo-row"
          size="large"
        >
          <DoNumberSetter
            num={score}
            newValue={score}
            onOk={(v) => {
              setScore(v);
              message.success(`评分已更新为 ${v}`);
            }}
          >
            评分 {score}
          </DoNumberSetter>
          <DoTxtSetter
            inline
            initValue={title}
            onOk={(v) => {
              setTitle(v);
              message.success('标题已更新');
            }}
          >
            <span>{title}</span>
          </DoTxtSetter>
        </Space>
      </Card>
    </div>
  );
}
