import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** 名称 + ID 双行单元格，对齐 kv3 `CellNameId.vue`。 */
@Component({
  selector: 'ka-cell-name-id',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'cell-name-id' },
  template: `
    <div class="name">{{ displayName() }}</div>
    @if (hasId()) {
      <div class="id">ID: {{ id() }}</div>
    }
  `,
})
export class CellNameId {
  readonly name = input<string | number | null | undefined>();
  readonly id = input<string | number | null | undefined>();
  readonly placeholder = input('—');

  protected readonly displayName = computed(() => {
    const name = this.name();
    return name == null || String(name).trim() === '' ? this.placeholder() : String(name);
  });
  protected readonly hasId = computed(() => {
    const id = this.id();
    return id != null && String(id).trim() !== '';
  });
}
