import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

import SchoolSelector from '@/modules/_example/schoolResource/_module/SchoolSelector';
import type { SchoolSelectorValue } from '@/modules/_example/schoolResource/_module/types';
import { message } from '@/plugins/antdApp';

export type SchoolSelectorDemoForm = {
  id: string;
  demoName: string;
  schoolSingle: SchoolSelectorValue | null;
  schoolMulti: SchoolSelectorValue[];
};

type FormValues = Omit<SchoolSelectorDemoForm, 'id'>;

export default function DialogEditSchoolSelectorDemo({
  open,
  seed,
  onClose,
  onSuccess,
}: {
  open: boolean;
  seed?: Partial<SchoolSelectorDemoForm> | null;
  onClose: () => void;
  onSuccess?: (payload: SchoolSelectorDemoForm) => void;
}) {
  const [form] = Form.useForm();
  const isEdit = !!seed?.id;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      demoName: seed?.demoName ?? '',
      schoolSingle: seed?.schoolSingle ?? null,
      schoolMulti: seed?.schoolMulti ? [...seed.schoolMulti] : [],
    });
  }, [open, seed, form]);

  async function handleOk() {
    const values = (await form.validateFields().catch(() => null)) as FormValues | null;
    if (!values) return;
    onSuccess?.({
      id: seed?.id || '',
      demoName: values.demoName.trim(),
      schoolSingle: values.schoolSingle,
      schoolMulti: [...(values.schoolMulti || [])],
    });
    message.success(isEdit ? '编辑演示已确认' : '新建演示已确认');
    onClose();
  }

  return (
    <Modal
      title={
        <span>
          {isEdit ? '编辑演示' : '新建演示'}
          {isEdit ? (
            <span className="dialog-edit-school-selector-demo-tips">（验证选择器回填）</span>
          ) : null}
        </span>
      }
      open={open}
      width={640}
      destroyOnHidden
      onCancel={onClose}
      onOk={handleOk}
      okText="确 定"
      cancelText="取 消"
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ flex: '120px' }}
        className="do-dialog-content-box"
      >
        <Form.Item
          label="演示名称"
          name="demoName"
          rules={[{ required: true, whitespace: true, message: '请输入演示名称' }]}
        >
          <Input
            allowClear
            placeholder="请输入演示名称"
          />
        </Form.Item>
        <Form.Item
          label="学校（单选）"
          name="schoolSingle"
          rules={[{ required: true, message: '请选择学校' }]}
        >
          <SchoolSelector />
        </Form.Item>
        <Form.Item
          label="学校（多选）"
          name="schoolMulti"
        >
          <SchoolSelector multiple />
        </Form.Item>
      </Form>
    </Modal>
  );
}
