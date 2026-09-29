import { Card } from 'antd';

import { DoSelector } from '@/components/DoSelector';

/** Alias page kept for gen-script compatibility; router uses UiKitDoSelectorDemo */
export default function UiKitSelectorDemo() {
  return (
    <Card title="DoSelector">
      <DoSelector
        options={[
          { value: 1, label: '选项甲' },
          { value: 2, label: '选项乙' },
        ]}
        clearable
      />
    </Card>
  );
}
