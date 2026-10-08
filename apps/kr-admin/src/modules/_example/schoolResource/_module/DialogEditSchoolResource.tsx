import { Form, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';

import maps from '@/maps';
import {
  requestEditSchoolResource,
  type SchoolResourceRow,
} from '@/modules/_example/schoolResource/_api';
import { message } from '@/plugins/antdApp';

type FormValues = {
  schoolName: string;
  status: number;
  remark: string;
};

export default function DialogEditSchoolResource({
  open,
  row,
  onClose,
  onSuccess,
}: {
  open: boolean;
  row?: SchoolResourceRow | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const status = maps.example.schoolResource.schoolStatus;
  const isEdit = !!row?.id;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      schoolName: row?.schoolName || '',
      status: row?.status ?? status.SCHOOL_STATUS_ENABLED,
      remark: row?.remark || '',
    });
  }, [open, row, form, status.SCHOOL_STATUS_ENABLED]);

  async function handleOk() {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    setLoading(true);
    try {
      await requestEditSchoolResource({
        id: row?.id || undefined,
        schoolName: values.schoolName.trim(),
        status: values.status,
        remark: (values.remark || '').trim(),
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
      open={open}
      title={
        <span>
          {isEdit ? '修改' : '添加'}学校
          {isEdit ? <span className="dialog-tips">(ID: {row?.id})</span> : null}
        </span>
      }
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
          name="schoolName"
          label="学校名称"
          rules={[{ required: true, whitespace: true, message: '请输入学校名称' }]}
        >
          <Input
            allowClear
            placeholder="请输入学校名称"
          />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
        >
          <Radio.Group options={status.options} />
        </Form.Item>
        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea
            rows={3}
            allowClear
            placeholder="选填"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
