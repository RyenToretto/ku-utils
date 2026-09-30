import { LineChartOutlined } from '@ant-design/icons';

export default function TrendHeader({ label }: { label: string }) {
  return (
    <span className="trend-header">
      {label}
      <LineChartOutlined />
    </span>
  );
}