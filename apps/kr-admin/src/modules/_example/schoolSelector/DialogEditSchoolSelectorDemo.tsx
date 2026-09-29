import { Form, Modal, message } from 'antd';
import { useEffect, useState } from 'react';

import SchoolSelector, {
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/SchoolSelector';

export default function DialogEditSchoolSelectorDemo({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm<{ school: SchoolSelectorValue }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) form.setFieldsValue({ school: null });
  }, [open, form]);

  async function handleOk() {
    const values = await form.validateFields();
    setLoading(true);
    try {
      message.success(`已选择：${(values.school as { label?: string } | null)?.label || '空'}`);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      title="编辑（回填学校）"
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="school"
          label="所属学校"
          rules={[{ required: true, message: '请选择学校' }]}
        >
          <SchoolSelector />
        </Form.Item>
      </Form>
    </Modal>
  );
}
