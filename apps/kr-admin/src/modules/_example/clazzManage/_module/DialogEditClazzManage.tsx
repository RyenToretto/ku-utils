import { Form, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';

import maps from '@/maps';
import { requestEditClazzManage, type ClazzManageRow } from '@/modules/_example/clazzManage/_api';
import SchoolSelector from '@/modules/_example/schoolResource/_module/SchoolSelector';
import {
  toSchoolPickFromRef,
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/types';
import { message } from '@/plugins/antdApp';

type FormValues = {
  clazzName: string;
  status: number;
  schoolPick: SchoolSelectorValue | null;
};

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
  const isEdit = !!row?.id;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      clazzName: row?.clazzName || '',
      status: row?.status ?? status.CLAZZ_STATUS_ENABLED,
      schoolPick:
        row?.schoolId != null
          ? toSchoolPickFromRef({ id: row.schoolId, schoolName: row.schoolName })
          : null,
    });
  }, [open, row, form, status.CLAZZ_STATUS_ENABLED]);

  async function handleOk() {
    const values = (await form.validateFields().catch(() => null)) as FormValues | null;
    if (!values) return;
    setLoading(true);
    try {
      await requestEditClazzManage({
        id: row?.id || undefined,
        clazzName: values.clazzName.trim(),
        status: values.status,
        schoolId: values.schoolPick?.id ?? null,
        schoolName: values.schoolPick?.item.schoolName || values.schoolPick?.label || '',
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
          {isEdit ? '修改' : '添加'}班级
          {isEdit ? <span className="dialog-tips">(ID: {row?.id})</span> : null}
        </span>
      }
      onCancel={onClose}
      onOk={handleOk}
      okText="确 定"
      cancelText="取 消"
      confirmLoading={loading}
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
          name="clazzName"
          label="班级名称"
          rules={[{ required: true, whitespace: true, message: '请输入班级名称' }]}
        >
          <Input
            allowClear
            placeholder="请输入班级名称"
          />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
        >
          <Radio.Group options={status.options} />
        </Form.Item>
        <Form.Item
          name="schoolPick"
          label="所属学校"
          rules={[{ required: true, message: '请选择所属学校' }]}
        >
          <SchoolSelector />
        </Form.Item>
      </Form>
    </Modal>
  );
}
