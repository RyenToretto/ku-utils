type AmountCellProps = {
  row: Record<string, unknown>;
  prop?: string;
};

export default function AmountCell({ row, prop = 'amount' }: AmountCellProps) {
  const val = row[prop];
  if (val == null || val === '') return <div className="amount-cell">—</div>;
  return <div className="amount-cell">{Number(val).toLocaleString('zh-CN')}</div>;
}
