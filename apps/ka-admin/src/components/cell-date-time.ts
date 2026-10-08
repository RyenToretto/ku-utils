import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { formatDateTime, parseDateTimeParts, type DateTimeInput } from '@/utils/date-time';

/** 时间单元格，对齐 kv3 `CellDateTime.vue`。 */
@Component({
  selector: 'ka-cell-date-time',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (variant() === 'inline') {
      <span class="cell-datetime-inline">{{ inlineText() }}</span>
    } @else if (layout() === 'with-actor') {
      <div class="cell-datetime cell-datetime-with-actor">
        <div class="cell-datetime-with-actor-body">
          <div class="name">{{ parts()?.compact ?? placeholder() }}</div>
          <div class="id">{{ actorText() || placeholder() }}</div>
        </div>
      </div>
    } @else if (!parts()) {
      <div class="name">{{ placeholder() }}</div>
    } @else if (layout() === 'compact') {
      <div class="name">{{ parts()!.compact }}</div>
    } @else if (dateOnly()) {
      <div class="name">{{ parts()!.date }}</div>
    } @else {
      <div class="name">{{ parts()!.date }}</div>
      <div class="id">{{ parts()!.time }}</div>
    }
  `,
})
export class CellDateTime {
  readonly value = input<DateTimeInput>();
  readonly actor = input<string | null>();
  readonly placeholder = input('—');
  readonly layout = input<'stacked' | 'compact' | 'with-actor'>('stacked');
  readonly dateOnly = input(false);
  readonly variant = input<'cell' | 'inline'>('cell');

  protected readonly parts = computed(() => parseDateTimeParts(this.value()));
  protected readonly actorText = computed(() => {
    const actor = this.actor();
    return actor == null ? '' : String(actor).trim();
  });
  protected readonly inlineText = computed(() => {
    const value = this.value();
    if (value == null || value === '') return this.placeholder();
    const formatted = formatDateTime(value);
    return formatted === '-' ? this.placeholder() : formatted;
  });
}
