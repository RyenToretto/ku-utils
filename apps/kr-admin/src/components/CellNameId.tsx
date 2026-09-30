export type CellNameIdProps = {
  name?: string | number | null;
  id?: string | number | null;
  placeholder?: string;
};

/** 名称 + ID 双行单元格，对齐 kv3 `CellNameId.vue`。 */
export function CellNameId({ name, id, placeholder = '—' }: CellNameIdProps) {
  const displayName = name == null || String(name).trim() === '' ? placeholder : String(name);
  const hasId = id != null && String(id).trim() !== '';

  return (
    <div className="cell-name-id">
      <div className="name">{displayName}</div>
      {hasId ? <div className="id">ID: {String(id)}</div> : null}
    </div>
  );
}

export default CellNameId;
