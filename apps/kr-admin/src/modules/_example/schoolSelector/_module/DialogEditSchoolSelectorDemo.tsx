import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

import SchoolSelector, {
  type SchoolSelectorValue,
} from '@/modules/_example/schoolResource/_module/SchoolSelector';
import { message } from '@/plugins/antdApp';

export type SchoolSelectorDemoForm = {
  id: string;
  demoName: string;
  schoolSingle: { id: string; label: string } | null;
  schoolMulti: Array<{ id: string; label: string }>;
};

export default function DialogEditSchoolSelectorDemo({
  open,
  seed,
  onClose,
  onSuccess,
}: {
  open: boolean;
  seed?: SchoolSelectorDemoForm | null;
  onClose: () => void;
  onSuccess?: (payload: SchoolSelectorDemoForm) => void;
}) {
  const [form] = Form.useForm<{
    demoName: string;
    schoolSingle: SchoolSelectorValue;
    schoolMulti: SchoolSelectorValue;
  }>();
  const isEdit = !!seed?.id;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      demoName: seed?.demoName ?? '',
      schoolSingle: seed?.schoolSingle ?? null,
      schoolMulti: seed?.schoolMulti ?? [],
    });
  }, [open, seed, form]);

  return (
    <Modal
      title={
        isEdit ? (
          <span>
            编辑演示
            <span className="dialog-edit-school-selector-demo-tips">（验证选择器回填）</span>
          </span>
        ) : (
          '新建演示'
        )
      }
      open={open}
      width={640}
      destroyOnHidden
      onCancel={onClose}
      onOk={async () => {
        const values = await form.validateFields().catch(() => null);
        if (!values) return;
        const single =
          values.schoolSingle && !Array.isArray(values.schoolSingle) ? values.schoolSingle : null;
        const multi = Array.isArray(values.schoolMulti) ? values.schoolMulti : [];
        if (!single) {
          message.error('请选择学校（单选）');
          return;
        }
        const payload: SchoolSelectorDemoForm = {
          id: seed?.id || '',
          demoName: values.demoName.trim(),
          schoolSingle: single,
          schoolMulti: multi,
        };
        message.success('已保存演示');
        onSuccess?.(payload);
        onClose();
      }}
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
          rules={[{ required: true, message: '请输入演示名称' }]}
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
          <SchoolSelector placeholder="请选择学校" />
        </Form.Item>
        <Form.Item
          label="学校（多选）"
          name="schoolMulti"
        >
          <SchoolSelector
            multiple
            placeholder="请选择学校（可多选）"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
