import { Form, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';

import maps from '@/maps';
import { requestEditClazzManage, type ClazzManageRow } from '@/modules/_example/clazzManage/_api';
import SchoolSelector, {
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/SchoolSelector';
import { message } from '@/plugins/antdApp';

export default function DialogEditClazzManage({
  open,
  row,
  onClose,
  onSuccess,
}: {
  open: boolean;
  row?: ClazzManageRow | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const status = maps.example.clazzManage.clazzStatus;

  useEffect(() => {
    if (!open) return;
    const school: SchoolSelectorValue = row?.schoolId
      ? { id: String(row.schoolId), label: row.schoolName || String(row.schoolId) }
      : null;
    form.setFieldsValue({
      clazzName: row?.clazzName || '',
      status: row?.status ?? status.CLAZZ_STATUS_ENABLED,
      school,
    });
  }, [open, row, form, status.CLAZZ_STATUS_ENABLED]);

  async function handleOk() {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;
    const school = values.school as SchoolSelectorValue;
    const schoolObj = school && !Array.isArray(school) ? school : null;
    setLoading(true);
    try {
      await requestEditClazzManage({
        id: row?.id,
        clazzName: values.clazzName,
        status: values.status,
        schoolId: schoolObj?.id ?? null,
        schoolName: schoolObj?.label,
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
      open={open}
      title={row?.id ? '编辑班级' : '新建班级'}
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
          name="clazzName"
          label="班级名称"
          rules={[{ required: true, message: '请输入班级名称' }]}
        >
          <Input maxLength={64} />
        </Form.Item>
        <Form.Item
          name="school"
          label="所属学校"
        >
          <SchoolSelector clearable />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group options={status.options} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
