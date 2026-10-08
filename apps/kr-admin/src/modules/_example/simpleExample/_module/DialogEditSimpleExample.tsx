import { Form, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';

import maps from '@/maps';
import { requestEditSimpleExample } from '@/modules/_example/simpleExample/_api';
import { message } from '@/plugins/antdApp';

type Row = {
  id?: string | number;
  exampleName?: string;
  pkg?: string;
  status?: number;
};

export type DialogEditSimpleExampleProps = {
  open: boolean;
  row?: Row | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DialogEditSimpleExample({
  open,
  row,
  onClose,
  onSuccess,
}: DialogEditSimpleExampleProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const statusOptions = maps.example.simpleExample.exampleStatus.options;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      pkg: row?.pkg || '',
      exampleName: row?.exampleName || '',
      status: row?.status ?? maps.example.simpleExample.exampleStatus.EXAMPLE_STATUS_ENABLED,
    });
  }, [open, row, form]);

  async function handleOk() {
    const values = await form.validateFields();
    setLoading(true);
    try {
      await requestEditSimpleExample({
        id: row?.id,
        exampleName: values.exampleName,
        status: values.status,
      });
      message.success(row?.id ? '已保存' : '已创建');
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={row?.id ? '编辑示例' : '新建示例'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnHidden
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="pkg"
          label="包名"
        >
          <Input placeholder="可选包名" />
        </Form.Item>
        <Form.Item
          name="exampleName"
          label="示例名称"
          rules={[{ required: true, message: '请输入示例名称' }]}
        >
          <Input
            placeholder="请输入示例名称"
            maxLength={64}
          />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group options={statusOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
