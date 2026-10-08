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

type FormValues = {
  pkg: string;
  exampleName: string;
  status: number;
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
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const statusOptions = maps.example.simpleExample.exampleStatus.options;
  const isEdit = !!row?.id;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      pkg: row?.pkg || '',
      exampleName: row?.exampleName || '',
      status: row?.status ?? maps.example.simpleExample.exampleStatus.EXAMPLE_STATUS_ENABLED,
    });
  }, [open, row, form]);

  async function handleOk() {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    setLoading(true);
    try {
      await requestEditSimpleExample({
        id: row?.id || undefined,
        exampleName: values.exampleName.trim(),
        status: values.status,
      });
      message.success(isEdit ? '修改成功' : '创建成功');
      onClose();
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={
        <span>
          {isEdit ? '修改' : '添加'}示例
          {isEdit ? <span className="dialog-title-tips">(ID: {row?.id})</span> : null}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="确 定"
      cancelText="取 消"
      confirmLoading={loading}
      destroyOnHidden
      width={520}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ flex: '100px' }}
        className="do-dialog-content-box"
      >
        <Form.Item
          name="pkg"
          label="产品包名"
          rules={[{ required: true, whitespace: true, message: '请输入产品包名' }]}
        >
          <Input
            allowClear
            placeholder="请输入产品包名"
          />
        </Form.Item>
        <Form.Item
          name="exampleName"
          label="示例名称"
          rules={[{ required: true, whitespace: true, message: '请输入示例名称' }]}
        >
          <Input
            allowClear
            placeholder="请输入示例名称"
          />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
        >
          <Radio.Group options={statusOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
