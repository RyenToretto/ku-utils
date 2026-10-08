import { Form, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';

import maps from '@/maps';
import {
  requestEditSchoolResource,
  type SchoolResourceRow,
} from '@/modules/_example/schoolResource/_api';
import { message } from '@/plugins/antdApp';

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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const status = maps.example.schoolResource.schoolStatus;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      schoolName: row?.schoolName || '',
      status: row?.status ?? status.SCHOOL_STATUS_ENABLED,
      remark: row?.remark || '',
    });
  }, [open, row, form, status.SCHOOL_STATUS_ENABLED]);

  async function handleOk() {
    const values = await form.validateFields();
    setLoading(true);
    try {
      await requestEditSchoolResource({ id: row?.id, ...values });
      message.success(row?.id ? '已保存' : '已创建');
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      title={row?.id ? '编辑学校' : '新建学校'}
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
          name="schoolName"
          label="学校名称"
          rules={[{ required: true, message: '请输入学校名称' }]}
        >
          <Input maxLength={64} />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group options={status.options} />
        </Form.Item>
        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea
            rows={3}
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
