import { Button, Card, Space, message } from 'antd';

export default function UiKitPreviewVideoDemo() {
  return (
    <Card title="预览视频">
      <Space>
        <Button
          type="primary"
          onClick={() => message.info('本 Demo 预留视频预览入口（可接 DialogPreviewVideo）')}
        >
          打开预览
        </Button>
      </Space>
    </Card>
  );
}
