import { Form, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';

import maps from '@/maps';
import {
  requestEditClubActivity,
  type ClubActivityRow,
} from '@/modules/_example/clubActivity/_api';
import SchoolSelector from '@/modules/_example/schoolResource/_module/SchoolSelector';
import {
  toSchoolPickFromRef,
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/types';
import { message } from '@/plugins/antdApp';

type FormValues = {
  clubName: string;
  status: number;
  schoolPick: SchoolSelectorValue[];
};

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
  const isEdit = !!row?.id;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      clubName: row?.clubName || '',
      status: row?.status ?? status.CLUB_STATUS_ENABLED,
      schoolPick: (row?.schools || []).map(toSchoolPickFromRef),
    });
  }, [open, row, form, status.CLUB_STATUS_ENABLED]);

  async function handleOk() {
    const values = (await form.validateFields().catch(() => null)) as FormValues | null;
    if (!values) return;
    setLoading(true);
    try {
      await requestEditClubActivity({
        id: row?.id || undefined,
        clubName: values.clubName.trim(),
        status: values.status,
        schools: values.schoolPick.map((pick) => ({
          id: pick.id,
          schoolName: pick.item.schoolName || pick.label,
        })),
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
      title={isEdit ? '编辑社团活动' : '新建社团活动'}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      maskClosable={false}
      destroyOnHidden
      width={560}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ flex: '100px' }}
        className="do-dialog-content-box"
      >
        <Form.Item
          name="clubName"
          label="活动名称"
          rules={[{ required: true, whitespace: true, message: '请输入活动名称' }]}
        >
          <Input
            maxLength={60}
            allowClear
            placeholder="请输入活动名称"
          />
        </Form.Item>
        <Form.Item
          label="状态"
          required
        >
          <Form.Item
            name="status"
            noStyle
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Radio.Group options={status.options} />
          </Form.Item>
          <span className="dialog-tips">仅启用状态可被业务引用</span>
        </Form.Item>
        <Form.Item
          name="schoolPick"
          label="关联学校"
          rules={[{ type: 'array', required: true, min: 1, message: '请至少选择一所学校' }]}
        >
          <SchoolSelector multiple />
        </Form.Item>
      </Form>
    </Modal>
  );
}
