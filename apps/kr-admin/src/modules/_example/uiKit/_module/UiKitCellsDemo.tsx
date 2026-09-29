import { Card, Space, Switch, Tag, Typography } from 'antd';

import { DoWordsTag } from '@/components/DoSelector';

export default function UiKitCellsDemo() {
  return (
    <div className="page-ui-kit-cells">
      <Card title="单元格与编辑器">
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%' }}
        >
          <div>
            <Typography.Text type="secondary">状态开关</Typography.Text>
            <div>
              <Switch
                checkedChildren="启用"
                unCheckedChildren="停用"
                defaultChecked
              />
            </div>
          </div>
          <div>
            <Typography.Text type="secondary">标签</Typography.Text>
            <div>
              <Tag color="success">启用</Tag>
              <Tag>停用</Tag>
            </div>
          </div>
          <div>
            <Typography.Text type="secondary">WordsTag</Typography.Text>
            <DoWordsTag
              words={['语文', '数学', '英语', '物理', '化学']}
              max={3}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
}
