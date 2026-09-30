import { Form, Input, Modal, Radio, message } from 'antd';
import { useEffect, useState } from 'react';

import maps from '@/maps';
import {
  requestEditClubActivity,
  type ClubActivityRow,
} from '@/modules/_example/clubActivity/_api';
import SchoolSelector, {
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/SchoolSelector';

export default function DialogEditClubActivity({
  open,
  row,
  onClose,
  onSuccess,
}: {
  open: boolean;
  row?: ClubActivityRow | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const status = maps.example.clubActivity.clubStatus;

  useEffect(() => {
    if (!open) return;
    const schools: SchoolSelectorValue = (row?.schools || []).map((s) => ({
      id: s.id,
      label: s.schoolName,
    }));
    form.setFieldsValue({
      clubName: row?.clubName || '',
      status: row?.status ?? status.CLUB_STATUS_ENABLED,
      schools,
    });
  }, [open, row, form, status.CLUB_STATUS_ENABLED]);

  async function handleOk() {
    const values = await form.validateFields();
    const schoolsVal = (values.schools || []) as Array<{ id: string; label: string }>;
    setLoading(true);
    try {
      await requestEditClubActivity({
        id: row?.id,
        clubName: values.clubName,
        status: values.status,
        schools: schoolsVal.map((s) => ({ id: s.id, schoolName: s.label })),
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
      title={row?.id ? '编辑社团' : '新建社团'}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnHidden
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="clubName"
          label="社团名称"
          rules={[{ required: true, message: '请输入社团名称' }]}
        >
          <Input maxLength={64} />
        </Form.Item>
        <Form.Item
          name="schools"
          label="关联学校"
        >
          <SchoolSelector
            multiple
            clearable
          />
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
