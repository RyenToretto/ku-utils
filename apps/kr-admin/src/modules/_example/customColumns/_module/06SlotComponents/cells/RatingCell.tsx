import { Rate } from 'antd';

type RatingCellProps = {
  row: Record<string, unknown>;
};

export default function RatingCell({ row }: RatingCellProps) {
  const score = Math.min(5, Number(row.score || 0) / 20);
  return (
    <div className="rating-cell">
      <Rate
        disabled
        allowHalf
        count={5}
        value={score}
      />
    </div>
  );
}
