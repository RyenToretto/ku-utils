import { Card, Checkbox, Space, TimePicker, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function UiKitScheduleWeekDemo() {
  const [days, setDays] = useState<string[]>(['周一', '周三']);
  return (
    <Card title="投放时段周">
      <Space
        direction="vertical"
        size="middle"
      >
        <div>
          <Typography.Text type="secondary">投放日</Typography.Text>
          <div>
            <Checkbox.Group
              options={DAYS}
              value={days}
              onChange={(v) => setDays(v as string[])}
            />
          </div>
        </div>
        <div>
          <Typography.Text type="secondary">时段</Typography.Text>
          <div>
            <TimePicker.RangePicker
              defaultValue={[dayjs('09:00', 'HH:mm'), dayjs('18:00', 'HH:mm')]}
              format="HH:mm"
            />
          </div>
        </div>
      </Space>
    </Card>
  );
}
