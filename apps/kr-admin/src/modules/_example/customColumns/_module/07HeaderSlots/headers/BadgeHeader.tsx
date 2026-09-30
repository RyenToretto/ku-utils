import { Tag } from 'antd';

export default function BadgeHeader({ label }: { label: string }) {
  return (
    <span className="badge-header">
      {label}
      <Tag
        color="warning"
        style={{ marginInlineEnd: 0 }}
      >
        HOT
      </Tag>
    </span>
  );
}
