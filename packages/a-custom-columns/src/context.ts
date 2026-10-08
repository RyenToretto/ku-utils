import {
  computed,
  contentChildren,
  Directive,
  inject,
  input,
  type Signal,
  TemplateRef,
} from '@angular/core';

import type { SchemaColumnConfig } from './schema-column-config';
import type { ColumnSchema } from './types';

/** 自定义单元格模板上下文：`let-value let-row="row" let-index="index" let-schema="schema"` */
export interface SchemaCellContext<T = Record<string, unknown>> {
  $implicit: unknown;
  value: unknown;
  row: T;
  index: number;
  schema: ColumnSchema;
  /** 已按 renderType 格式化的文本 */
  text: string;
}

/** 自定义列头模板上下文：`let-schema` */
export interface SchemaHeaderContext {
  $implicit: ColumnSchema;
  schema: ColumnSchema;
}

/** 按 prop 覆盖单元格渲染：`<ng-template kuSchemaCellDef="roi" let-row="row">…</ng-template>` */
@Directive({ selector: 'ng-template[kuSchemaCellDef]' })
export class KuSchemaCellDef {
  readonly prop = input.required<string>({ alias: 'kuSchemaCellDef' });
  readonly template = inject<TemplateRef<SchemaCellContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: KuSchemaCellDef, _ctx: unknown): _ctx is SchemaCellContext {
    return true;
  }
}

/** 按 prop 覆盖列头渲染：`<ng-template kuSchemaHeaderDef="roi" let-schema>…</ng-template>` */
@Directive({ selector: 'ng-template[kuSchemaHeaderDef]' })
export class KuSchemaHeaderDef {
  readonly prop = input.required<string>({ alias: 'kuSchemaHeaderDef' });
  readonly template = inject<TemplateRef<SchemaHeaderContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: KuSchemaHeaderDef,
    _ctx: unknown,
  ): _ctx is SchemaHeaderContext {
    return true;
  }
}

/**
 * 自定义列上下文（等价 React SchemaColumnConfigContext.Provider）。
 *
 * 宿主子树内的 ku-do-table-header / ku-schema-cell / ku-schema-header 自动取用；
 * 同一子树内的 `kuSchemaCellDef` / `kuSchemaHeaderDef` 模板按 prop 注册。
 */
@Directive({ selector: '[kuSchemaColumnConfig]' })
export class KuSchemaColumnConfig {
  readonly config = input.required<SchemaColumnConfig>({ alias: 'kuSchemaColumnConfig' });

  private readonly cellDefs = contentChildren(KuSchemaCellDef, { descendants: true });
  private readonly headerDefs = contentChildren(KuSchemaHeaderDef, { descendants: true });

  readonly cellTemplates: Signal<Map<string, KuSchemaCellDef['template']>> = computed(
    () => new Map(this.cellDefs().map((d) => [d.prop(), d.template])),
  );

  readonly headerTemplates: Signal<Map<string, KuSchemaHeaderDef['template']>> = computed(
    () => new Map(this.headerDefs().map((d) => [d.prop(), d.template])),
  );
}

/** 取最近的 `[kuSchemaColumnConfig]`；不存在时返回 null */
export function injectSchemaColumnConfigHost(): KuSchemaColumnConfig | null {
  return inject(KuSchemaColumnConfig, { optional: true });
}
