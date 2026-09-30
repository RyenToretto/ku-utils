import { formatDateTime, parseDateTimeParts, type DateTimeInput } from '@/utils/dateTime';

export type CellDateTimeProps = {
  value: DateTimeInput;
  actor?: string | null;
  placeholder?: string;
  layout?: 'stacked' | 'compact' | 'with-actor';
  dateOnly?: boolean;
  variant?: 'cell' | 'inline';
};

/** 时间单元格，对齐 kv3 `CellDateTime.vue`。 */
export function CellDateTime({
  value,
  actor,
  placeholder = '—',
  layout = 'stacked',
  dateOnly = false,
  variant = 'cell',
}: CellDateTimeProps) {
  const parts = parseDateTimeParts(value);
  const hasValue = parts != null;

  if (variant === 'inline') {
    const formatted =
      value == null || value === '' ? placeholder : formatDateTime(value);
    return (
      <span className="cell-datetime-inline">
        {formatted === '-' ? placeholder : formatted}
      </span>
    );
  }

  if (layout === 'with-actor') {
    const actorText = actor == null ? '' : String(actor).trim();
    return (
      <div className="cell-datetime cell-datetime-with-actor">
        <div className="cell-datetime-with-actor-body">
          <div className="name">{hasValue ? parts!.compact : placeholder}</div>
          <div className="id">{actorText || placeholder}</div>
        </div>
      </div>
    );
  }

  if (!hasValue) {
    return <div className="name">{placeholder}</div>;
  }

  if (layout === 'compact') {
    return <div className="name">{parts!.compact}</div>;
  }

  if (dateOnly) {
    return <div className="name">{parts!.date}</div>;
  }

  return (
    <>
      <div className="name">{parts!.date}</div>
      <div className="id">{parts!.time}</div>
    </>
  );
}

export default CellDateTime;
