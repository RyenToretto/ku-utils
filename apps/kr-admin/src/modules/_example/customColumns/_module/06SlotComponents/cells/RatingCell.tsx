import { StarFilled } from '@ant-design/icons';

type RatingCellProps = {
  row: Record<string, unknown>;
};

const STAR_COUNT = 5;

/** 只读评分：与 el-rate disabled 一致按小数精确填充（antd Rate 只能整/半星） */
export default function RatingCell({ row }: RatingCellProps) {
  const score = Math.min(STAR_COUNT, Number(row.score || 0) / 20);
  return (
    <div className="rating-cell">
      <span
        className="do-rate"
        role="img"
        aria-label={`评分 ${score}`}
      >
        {Array.from({ length: STAR_COUNT }, (_, i) => {
          const fill = Math.max(0, Math.min(1, score - i));
          return (
            <span
              key={i}
              className="do-rate-item"
            >
              <StarFilled />
              {fill > 0 && (
                <span
                  className="do-rate-fill"
                  style={{ width: `${fill * 100}%` }}
                >
                  <StarFilled />
                </span>
              )}
            </span>
          );
        })}
      </span>
    </div>
  );
}
