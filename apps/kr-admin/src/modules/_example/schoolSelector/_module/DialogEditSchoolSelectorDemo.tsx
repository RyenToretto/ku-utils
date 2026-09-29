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
  const [school, setSchool] = useState<SchoolSelectorValue>(null);

  useEffect(() => {
    if (open) setSchool(null);
  }, [open]);

  return (
    <Modal
      title="学校选择器 Demo"
      open={open}
      onCancel={onClose}
      onOk={() => {
        const label =
          school && !Array.isArray(school)
            ? school.label
            : Array.isArray(school)
              ? school.map((s) => s.label).join('、')
              : '';
        message.success(label ? `已选择 ${label}` : '未选择');
        onClose();
      }}
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item
          label="学校"
          required
        >
          <SchoolSelector
            value={school}
            onChange={setSchool}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
