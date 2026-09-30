import { Button, Card, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

import ScheduleTimeWeekPicker from '@/components/ScheduleTimeWeekPicker';
import {
  EMPTY_SCHEDULE_TIME,
  SCHEDULE_TIME_LENGTH,
  SCHEDULE_TIME_SLOTS_PER_DAY,
  normalizeScheduleTimeBitmap,
} from '@/utils/scheduleTime';

export default function UiKitScheduleWeekDemo() {
  const [bitmap, setBitmap] = useState(EMPTY_SCHEDULE_TIME);

  const bitmapPreview = useMemo(() => {
    const bits = normalizeScheduleTimeBitmap(bitmap);
    const ones = bits.split('').filter((c) => c === '1').length;
    return `${ones} / ${SCHEDULE_TIME_LENGTH}`;
  }, [bitmap]);

  function clearBitmap() {
    setBitmap(EMPTY_SCHEDULE_TIME);
  }

  /** Demo：周一至周五 09:00–12:00 */
  function fillWeekdaysMorning() {
    const chars = EMPTY_SCHEDULE_TIME.split('');
    for (let day = 0; day < 5; day += 1) {
      const dayStart = day * SCHEDULE_TIME_SLOTS_PER_DAY;
      for (let slot = 18; slot < 24; slot += 1) {
        chars[dayStart + slot] = '1';
      }
    }
    setBitmap(chars.join(''));
  }

  return (
    <div className="page-ui-kit-schedule-week">
      <Card
        size="small"
        className="ui-kit-demo-card"
        title="投放时段周网格"
      >
        <ScheduleTimeWeekPicker
          value={bitmap}
          onChange={setBitmap}
        />
        <Space
          className="ui-kit-demo-actions"
          wrap
        >
          <Button onClick={clearBitmap}>清空</Button>
          <Button
            type="primary"
            onClick={fillWeekdaysMorning}
          >
            工作日上午预设
          </Button>
        </Space>
        <Typography.Paragraph
          type="secondary"
          className="ui-kit-demo-hint"
        >
          位图长度：{bitmap.length}
        </Typography.Paragraph>
        <Typography.Paragraph
          type="secondary"
          className="ui-kit-demo-hint ui-kit-demo-mono"
        >
          {bitmapPreview}
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
