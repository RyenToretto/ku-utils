import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { injectSchemaColumnConfigHost, type SchemaCellContext } from '../context';
import type { ColumnSchema } from '../types';

/**
 * 按 schema 渲染单元格：优先 `kuSchemaCellDef` 模板，否则按 renderType 格式化文本。
 * 放在 nz-table 的 `td` 内使用。
 */
@Component({
  selector: 'ku-schema-cell',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ku-schema-cell' },
  template: `
    @let tpl = cellTemplate();
    @if (tpl) {
      <ng-container *ngTemplateOutlet="tpl; context: context()" />
    } @else if (schema().showOverflowTooltip) {
      <span
        class="schema-cell-ellipsis"
        [attr.title]="context().text"
      >
        {{ context().text }}
      </span>
    } @else {
      {{ context().text }}
    }
  `,
})
export class KuSchemaCell {
  readonly schema = input.required<ColumnSchema>();
  readonly row = input.required<object>();
  readonly index = input(0);

  private readonly host = injectSchemaColumnConfigHost();

  protected readonly cellTemplate = computed(() => {
    const prop = this.schema().prop;
    return prop ? (this.host?.cellTemplates().get(prop) ?? null) : null;
  });

  protected readonly context = computed<SchemaCellContext>(() => {
    const schema = this.schema();
    const row = this.row() as Record<string, unknown>;
    const value = schema.prop ? row[schema.prop] : undefined;
    const config = this.host?.config();
    const text = config
      ? config.formatSchemaCell(value, schema)
      : value === null || value === undefined || value === ''
        ? '-'
        : String(value);
    return { $implicit: value, value, row, index: this.index(), schema, text };
  });
}

/**
 * 按 schema 渲染列头：优先 `kuSchemaHeaderDef` 模板，其次 headerTooltip，最后 label。
 * 放在 nz-table 的 `th` 内使用。
 */
@Component({
  selector: 'ku-schema-header',
  imports: [NgTemplateOutlet, NzTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ku-schema-header' },
  template: `
    @let tpl = headerTemplate();
    @if (tpl) {
      <ng-container *ngTemplateOutlet="tpl; context: { $implicit: schema(), schema: schema() }" />
    } @else if (schema().headerTooltip) {
      <span
        class="schema-col-header-tip"
        nz-tooltip
        [nzTooltipTitle]="schema().headerTooltip"
      >
        {{ schema().label }}
      </span>
    } @else {
      {{ schema().label }}
    }
  `,
})
export class KuSchemaHeader {
  readonly schema = input.required<ColumnSchema>();

  private readonly host = injectSchemaColumnConfigHost();

  protected readonly headerTemplate = computed(() => {
    const prop = this.schema().prop;
    return prop ? (this.host?.headerTemplates().get(prop) ?? null) : null;
  });
}
