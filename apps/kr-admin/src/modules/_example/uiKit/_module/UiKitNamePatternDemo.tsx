import { Card, Descriptions, Typography } from 'antd';

export default function UiKitNamePatternDemo() {
  return (
    <Card title="命名模板">
      <Typography.Paragraph type="secondary">
        Layer / List / DialogXxx / XxxSelector 命名约定与 kv3 对齐。
      </Typography.Paragraph>
      <Descriptions
        bordered
        size="small"
        column={1}
      >
        <Descriptions.Item label="路由落点">XxxLayer.tsx</Descriptions.Item>
        <Descriptions.Item label="表格">_module/XxxList.tsx</Descriptions.Item>
        <Descriptions.Item label="弹层">DialogXxx.tsx</Descriptions.Item>
        <Descriptions.Item label="选择器">XxxSelector + DialogSelectXxx</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
