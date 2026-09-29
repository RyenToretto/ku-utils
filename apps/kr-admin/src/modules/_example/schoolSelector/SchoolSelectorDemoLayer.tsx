import { Button, Card, Space, Typography } from 'antd';
import { useState } from 'react';

import DialogEditSchoolSelectorDemo from './DialogEditSchoolSelectorDemo';

import DoFilterPanel from '@/components/DoFilterPanel';
import SchoolSelector, {
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/SchoolSelector';

export default function SchoolSelectorDemoLayer() {
  const [single, setSingle] = useState<SchoolSelectorValue>(null);
  const [multi, setMulti] = useState<SchoolSelectorValue>([]);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="page-school-selector-demo">
      <DoFilterPanel hideSearch>
        <div className="do-filter-field">
          <span className="do-filter-field-label">单选学校</span>
          <SchoolSelector
            value={single}
            onChange={setSingle}
            clearable
          />
        </div>
        <div className="do-filter-field">
          <span className="do-filter-field-label">多选学校</span>
          <SchoolSelector
            value={multi}
            onChange={setMulti}
            multiple
            clearable
          />
        </div>
        <Button
          type="primary"
          size="small"
          onClick={() => setEditOpen(true)}
        >
          打开编辑弹层
        </Button>
      </DoFilterPanel>
      <Card>
        <Typography.Paragraph>
          单选：{single && !Array.isArray(single) ? single.label : '未选'}
        </Typography.Paragraph>
        <Typography.Paragraph>
          多选：
          {Array.isArray(multi) && multi.length ? multi.map((m) => m.label).join('、') : '未选'}
        </Typography.Paragraph>
        <Space>
          <Button
            onClick={() => {
              setSingle(null);
              setMulti([]);
            }}
          >
            清空
          </Button>
        </Space>
      </Card>
      <DialogEditSchoolSelectorDemo
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
