import { Tag } from 'antd';

export default function BadgeHeader({ label }: { label: string }) {
  return (
    <span className="badge-header">
      {label}
      <Tag color="warning">HOT</Tag>
    </span>
  );
}
