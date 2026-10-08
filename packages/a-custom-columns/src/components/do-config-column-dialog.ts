import { type CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  Injector,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CloseOutline, LockOutline, SearchOutline } from '@ant-design/icons-angular/icons';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule, provideNzIconsPatch } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { injectSchemaColumnConfigHost } from '../context';
import { DEFAULT_CUSTOM_COLUMN_MESSAGES } from '../schema-column-config';
import type { ColumnConfig, TableColumnMeta } from '../types';

import { KuDoReadColumnConfig } from './do-read-column-config';

/**
 * 自定义列配置抽屉：左侧分组导航、中间分组勾选、右侧已选列（固定区 + CDK 拖拽排序），
 * 底部存到本地 / 读取本地 / 取消 / 完成。需在 `[kuSchemaColumnConfig]` 子树内使用。
 */
@Component({
  selector: 'ku-do-config-column-dialog',
  imports: [
    FormsModule,
    DragDropModule,
    NzDrawerModule,
    NzInputModule,
    NzIconModule,
    NzCheckboxModule,
    NzButtonModule,
    NzPopoverModule,
    KuDoReadColumnConfig,
  ],
  providers: [provideNzIconsPatch([CloseOutline, LockOutline, SearchOutline])],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../style.css',
  template: `
    <nz-drawer
      [nzVisible]="visible()"
      [nzWidth]="1000"
      nzPlacement="right"
      [nzClosable]="false"
      nzWrapClassName="do-config-column-dialog"
      [nzTitle]="titleTpl"
      [nzExtra]="extraTpl"
      (nzOnClose)="cancelColumnConfig()"
    >
      <ng-template #titleTpl>
        <span class="drawer-title">
          {{ messages().customColumns }}
          <span
            class="tips"
            [class.status-warning]="newConfigName() === noNameLabel()"
            [class.status-success]="newConfigName() !== noNameLabel()"
          >
            ({{ newConfigName() }})
          </span>
        </span>
      </ng-template>
      <ng-template #extraTpl>
        <button
          type="button"
          class="drawer-close"
          aria-label="Close"
          (click)="cancelColumnConfig()"
        >
          <span
            nz-icon
            nzType="close"
          ></span>
        </button>
      </ng-template>

      <ng-container *nzDrawerContent>
        <div class="drawer-wrap">
          <div class="col-dialog-body">
            <div class="cfg-search">
              <nz-input-wrapper nzAllowClear>
                <span
                  nzInputPrefix
                  nz-icon
                  nzType="search"
                ></span>
                <input
                  nz-input
                  nzSize="small"
                  [placeholder]="messages().searchPlaceholder"
                  [ngModel]="searchKeyword()"
                  (ngModelChange)="searchKeyword.set($event)"
                />
              </nz-input-wrapper>
            </div>

            <div class="cfg-panels">
              <div class="cfg-left">
                @for (group of uniqueGroups(); track group) {
                  <div
                    class="nav-link"
                    [class.active]="activeNavGroup() === group"
                    role="button"
                    tabindex="0"
                    (click)="scrollToGroup(group)"
                    (keydown.enter)="scrollToGroup(group)"
                  >
                    {{ group }}
                  </div>
                }
              </div>

              <div
                #midPanel
                class="cfg-mid"
                (scroll)="onMidScroll()"
              >
                @for (group of filteredGroups(); track group.label) {
                  <div
                    class="grp-section"
                    [attr.data-group]="group.label"
                  >
                    <div class="grp-head">
                      <span class="grp-label">{{ group.label }}</span>
                      <span class="grp-actions">
                        <a
                          role="button"
                          tabindex="0"
                          (click)="groupSelect(group.label, true)"
                          (keydown.enter)="groupSelect(group.label, true)"
                        >
                          {{ messages().selectAll }}
                        </a>
                        <a
                          role="button"
                          tabindex="0"
                          (click)="groupSelect(group.label, false)"
                          (keydown.enter)="groupSelect(group.label, false)"
                        >
                          {{ messages().invertSelection }}
                        </a>
                      </span>
                    </div>
                    <div class="grp-grid">
                      @for (col of group.children; track col.property) {
                        <div class="grp-item">
                          <label
                            nz-checkbox
                            [ngModel]="col.visible"
                            [nzDisabled]="unableToControl(col)"
                            (ngModelChange)="toggleColumnCheck($event, col)"
                          >
                            {{ col.label }}
                          </label>
                        </div>
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="grp-empty">{{ messages().emptySearch }}</div>
                }
              </div>

              <div class="cfg-right">
                <div class="sel-header">
                  <span class="sel-count">
                    {{ messages().selectedCount(emitColumnConfig().length, maxCount()) }}
                  </span>
                  <a
                    class="sel-reset"
                    role="button"
                    tabindex="0"
                    (click)="resetConfig()"
                    (keydown.enter)="resetConfig()"
                  >
                    {{ messages().reset }}
                  </a>
                </div>

                <div class="sel-body">
                  @if (fixedSelectedCols().length) {
                    <div class="sel-fix-zone">
                      @for (col of fixedSelectedCols(); track col.property) {
                        <div class="sel-fix-row">
                          <span
                            nz-icon
                            nzType="lock"
                            class="sel-lock"
                          ></span>
                          <span class="sel-fix-name">{{ col.label }}</span>
                        </div>
                      }
                    </div>
                    <div class="sel-sepline">
                      <span class="sel-septip">{{ messages().fixedColumnsTip }}</span>
                    </div>
                  }

                  <div class="sel-drag-zone">
                    <div
                      cdkDropList
                      cdkDropListLockAxis="y"
                      (cdkDropListDropped)="onDrop($event)"
                    >
                      @for (col of draggableList(); track col.property) {
                        <div
                          class="sel-drag-row"
                          cdkDrag
                          cdkDragPreviewContainer="parent"
                        >
                          <span
                            class="sel-drag-handle"
                            cdkDragHandle
                          >
                            <span class="sel-drag-dots"></span>
                          </span>
                          <span
                            class="sel-drag-name"
                            [title]="col.label"
                          >
                            {{ col.label }}
                          </span>
                          <span
                            nz-icon
                            nzType="close"
                            class="sel-remove"
                            role="button"
                            tabindex="0"
                            aria-label="移除"
                            (click)="removeSelectedItem(col.property)"
                            (keydown.enter)="removeSelectedItem(col.property)"
                          ></span>
                        </div>
                      }
                    </div>
                    @if (draggableList().length === 0) {
                      <div class="sel-empty">{{ messages().emptySelected }}</div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="drawer-foot">
            <div class="left-btn-group">
              <button
                nz-button
                nz-popover
                [nzPopoverTrigger]="null"
                nzPopoverPlacement="top"
                nzPopoverOverlayClassName="save-to-local-popper"
                [nzPopoverVisible]="popperSaveToLocal()"
                [nzPopoverContent]="saveTpl"
                (click)="toSaveToLocal()"
              >
                {{ messages().saveToLocal }}
              </button>
              <ng-template #saveTpl>
                <div class="save-to-local-form">
                  <input
                    #configNameInput
                    nz-input
                    class="storage-key-will-save"
                    [placeholder]="messages().configNamePlaceholder"
                    [ngModel]="newConfigName()"
                    (ngModelChange)="newConfigName.set($event)"
                    (keydown.enter)="doSaveToLocal()"
                  />
                  <button
                    nz-button
                    nzSize="small"
                    (click)="cancelSaveToLocal()"
                  >
                    {{ messages().cancel }}
                  </button>
                  <button
                    nz-button
                    nzSize="small"
                    (click)="doSaveToLocal()"
                  >
                    {{ messages().save }}
                  </button>
                </div>
              </ng-template>

              <button
                nz-button
                nz-popover
                nzPopoverTrigger="click"
                nzPopoverPlacement="top"
                nzPopoverOverlayClassName="read-from-local-popper"
                [nzPopoverVisible]="popperReadFromLocal()"
                [nzPopoverContent]="readTpl"
                (nzPopoverVisibleChange)="onReadPopoverChange($event)"
              >
                {{ messages().readFromLocal }}
              </button>
              <ng-template #readTpl>
                <ku-do-read-column-config
                  (confirm)="applyReadConfig($event)"
                  (remove)="removeConfig($event)"
                  (closed)="popperReadFromLocal.set(false)"
                />
              </ng-template>
            </div>

            <div class="right-btn-group">
              <button
                nz-button
                (click)="cancelColumnConfig()"
              >
                {{ messages().cancel }}
              </button>
              <button
                nz-button
                nzType="primary"
                (click)="confirmColumnConfig()"
              >
                {{ messages().complete }}
              </button>
            </div>
          </div>
        </div>
      </ng-container>
    </nz-drawer>
  `,
})
export class KuDoConfigColumnDialog {
  /** 点击「完成」，携带当前配置 */
  readonly confirm = output<ColumnConfig>();

  private readonly host = injectSchemaColumnConfigHost();
  private readonly message = inject(NzMessageService);
  private readonly injector = inject(Injector);
  private readonly midPanel = viewChild<ElementRef<HTMLElement>>('midPanel');
  private readonly configNameInput = viewChild<ElementRef<HTMLInputElement>>('configNameInput');

  protected readonly visible = signal(false);
  protected readonly popperSaveToLocal = signal(false);
  protected readonly popperReadFromLocal = signal(false);
  protected readonly columnList = signal<TableColumnMeta[]>([]);
  protected readonly emitColumnConfig = signal<TableColumnMeta[]>([]);
  protected readonly searchKeyword = signal('');
  protected readonly activeNavGroup = signal('');

  protected readonly messages = computed(
    () => this.host?.config().messages ?? DEFAULT_CUSTOM_COLUMN_MESSAGES,
  );
  protected readonly noNameLabel = computed(
    () => this.host?.config().noNameLabel || this.messages().noNameLabel,
  );
  protected readonly maxCount = computed(() => this.host?.config().maxSelectCount || 50);
  protected readonly newConfigName = signal('');

  protected readonly uniqueGroups = computed(() => [
    ...new Set(this.columnList().map((item) => this.groupOf(item))),
  ]);

  protected readonly filteredGroups = computed(() => {
    const keyword = this.searchKeyword().trim().toLowerCase();
    const groupMap = new Map<string, TableColumnMeta[]>();
    this.columnList().forEach((item) => {
      if (keyword && !item.label.toLowerCase().includes(keyword)) return;
      const g = this.groupOf(item);
      if (!groupMap.has(g)) groupMap.set(g, []);
      groupMap.get(g)!.push(item);
    });
    return this.uniqueGroups()
      .filter((g) => groupMap.has(g))
      .map((g) => ({ label: g, children: groupMap.get(g)! }));
  });

  private readonly alwaysCols = computed<TableColumnMeta[]>(() =>
    (this.host?.config().alwaysVisibleColumns || []).map((col) => ({
      property: col.prop,
      label: col.label,
      fixed: true,
      group: this.messages().groupFallback,
      isLeaf: true,
      visible: true,
      _alwaysVisible: true,
    })),
  );

  protected readonly fixedSelectedCols = computed(() => [
    ...this.alwaysCols(),
    ...this.emitColumnConfig().filter((c) => this.unableToControl(c)),
  ]);

  protected readonly draggableList = computed(() =>
    this.emitColumnConfig().filter((c) => !this.unableToControl(c)),
  );

  /** 打开抽屉；不传则用默认配置 */
  showConfigColumnDialog(currentConfig?: ColumnConfig): void {
    const config = this.host?.config();
    if (!config) return;
    const columnConfig = currentConfig || config.getDefaultConfig();
    if (!columnConfig) return;
    this.applyConfig(columnConfig);
    const first = config.tableColumns()[0];
    this.activeNavGroup.set(first ? this.groupOf(first) : '');
    this.searchKeyword.set('');
    this.visible.set(true);
  }

  protected unableToControl(col: TableColumnMeta): boolean {
    return (
      col.type === 'selection' ||
      col.fixed ||
      col.label === this.messages().operationColumnLabel ||
      col.label === '操作'
    );
  }

  private groupOf(col: TableColumnMeta): string {
    return col.group || this.messages().groupFallback;
  }

  /** 与本地缓存逐一比对，命中则沿用其名称，否则视为未命名 */
  private matchConfigName(cols: TableColumnMeta[]): string | null {
    const cache = this.host?.config().readCacheConfig();
    if (!cache) return null;
    const temp = JSON.stringify(cols.map((item) => item.property));
    const hit = cache.columnConfig.filter((c) => JSON.stringify(c.columns) === temp);
    return hit.length ? hit[hit.length - 1].label : this.noNameLabel();
  }

  private commitEmit(cols: TableColumnMeta[]): void {
    this.emitColumnConfig.set(cols);
    const name = this.matchConfigName(cols);
    if (name !== null) this.newConfigName.set(name);
  }

  private syncEmitWithVisible(list: TableColumnMeta[]): void {
    const visibleProps = list.filter((c) => c.visible).map((c) => c.property);
    const next = this.emitColumnConfig().filter((c) => visibleProps.includes(c.property));
    visibleProps.forEach((property) => {
      if (next.some((c) => c.property === property)) return;
      const col = list.find((c) => c.property === property);
      if (col) next.push(col);
    });
    this.columnList.set(list);
    this.commitEmit(next);
  }

  private pickColumns(list: TableColumnMeta[], props: string[]): TableColumnMeta[] {
    return props
      .map((property) => list.find((c) => c.property === property))
      .filter((c): c is TableColumnMeta => !!c);
  }

  private applyConfig(columnConfig: ColumnConfig): void {
    const config = this.host?.config();
    if (!config) return;
    this.newConfigName.set(columnConfig.label);
    const all = config.tableColumns().map((item) => ({
      ...item,
      visible: columnConfig.columns.includes(item.property as string),
    }));
    this.columnList.set(all);
    this.emitColumnConfig.set(this.pickColumns(all, columnConfig.columns));
  }

  private closePoppers(): void {
    this.popperSaveToLocal.set(false);
    this.popperReadFromLocal.set(false);
  }

  protected cancelColumnConfig(): void {
    this.closePoppers();
    this.visible.set(false);
    this.host?.config().onDialogClose?.();
  }

  protected confirmColumnConfig(): void {
    this.closePoppers();
    this.visible.set(false);
    this.confirm.emit({
      label: this.newConfigName() || this.noNameLabel(),
      columns: this.emitColumnConfig()
        .filter((c) => !c._alwaysVisible)
        .map((c) => c.property as string),
    });
  }

  protected resetConfig(): void {
    const config = this.host?.config();
    const defaultConfig = config?.getDefaultConfig();
    if (!config || !defaultConfig) return;
    this.applyConfig(defaultConfig);
    const name = this.matchConfigName(
      this.pickColumns(config.tableColumns(), defaultConfig.columns),
    );
    if (name !== null) this.newConfigName.set(name);
  }

  protected toggleColumnCheck(checked: boolean, col: TableColumnMeta): void {
    if (checked && !this.unableToControl(col)) {
      if (this.draggableList().length + 1 > this.maxCount()) {
        this.message.warning(this.messages().maxSelectedWarning(this.maxCount()));
        // 回滚复选框视觉状态
        this.columnList.set([...this.columnList()]);
        return;
      }
    }
    this.syncEmitWithVisible(
      this.columnList().map((item) =>
        item.property === col.property ? { ...item, visible: checked } : item,
      ),
    );
  }

  /** selectAll=true 全选，false 反选 */
  protected groupSelect(group: string, selectAll: boolean): void {
    this.syncEmitWithVisible(
      this.columnList().map((item) =>
        !this.unableToControl(item) && this.groupOf(item) === group
          ? { ...item, visible: selectAll ? true : !item.visible }
          : item,
      ),
    );
  }

  protected removeSelectedItem(property?: string): void {
    this.columnList.update((list) =>
      list.map((item) => (item.property === property ? { ...item, visible: false } : item)),
    );
    this.commitEmit(this.emitColumnConfig().filter((c) => c.property !== property));
  }

  protected onDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const current = this.emitColumnConfig();
    const reordered = current.filter((c) => !this.unableToControl(c));
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    const schemaFixed = current.filter((c) => this.unableToControl(c) && !c._alwaysVisible);
    this.commitEmit([...schemaFixed, ...reordered]);
  }

  protected scrollToGroup(group: string): void {
    this.activeNavGroup.set(group);
    const panel = this.midPanel()?.nativeElement;
    const domEl = panel?.querySelector<HTMLElement>(`[data-group="${CSS.escape(group)}"]`);
    if (domEl && panel) {
      panel.scrollTo({ top: domEl.offsetTop - panel.offsetTop, behavior: 'smooth' });
    }
  }

  protected onMidScroll(): void {
    const panel = this.midPanel()?.nativeElement;
    if (!panel) return;
    const { scrollTop } = panel;
    const groups = this.uniqueGroups();
    for (let i = groups.length - 1; i >= 0; i--) {
      const domEl = panel.querySelector<HTMLElement>(`[data-group="${CSS.escape(groups[i])}"]`);
      if (!domEl) continue;
      if (domEl.offsetTop - panel.offsetTop <= scrollTop + 8) {
        this.activeNavGroup.set(groups[i]);
        break;
      }
    }
  }

  protected onReadPopoverChange(open: boolean): void {
    this.popperReadFromLocal.set(open);
    if (open) this.popperSaveToLocal.set(false);
  }

  protected applyReadConfig(config: ColumnConfig): void {
    const ctx = this.host?.config();
    if (!ctx || !config || !config.label || !this.columnList().length) return;
    const columns =
      !config.columns || !config.columns.length || config.columns.includes('ALL')
        ? ctx.tableColumns().map((each) => each.property as string)
        : config.columns;
    this.popperReadFromLocal.set(false);
    this.newConfigName.set(config.label);
    const list = this.columnList().map((item) => ({
      ...item,
      visible: columns.includes(item.property as string),
    }));
    this.columnList.set(list);
    this.emitColumnConfig.set(this.pickColumns(list, columns));
  }

  protected removeConfig(label: string): void {
    this.host?.config().removeConfigFromLocal(label);
  }

  protected toSaveToLocal(): void {
    this.newConfigName.set('');
    this.popperSaveToLocal.set(true);
    this.popperReadFromLocal.set(false);
    afterNextRender(() => this.configNameInput()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected doSaveToLocal(): void {
    const config = this.host?.config();
    const name = this.newConfigName().trim();
    if (!config || !name) {
      this.message.warning(this.messages().configNameRequired);
      return;
    }
    if (config.readCacheConfig()?.columnConfig?.some((c) => c.label === name)) {
      this.message.warning(this.messages().configNameExists);
      return;
    }
    config.saveConfigToLocal(
      name,
      this.emitColumnConfig().map((c) => c.property as string),
    );
    this.newConfigName.set(name);
    this.popperSaveToLocal.set(false);
    this.message.success(this.messages().configSaved);
  }

  protected cancelSaveToLocal(): void {
    const name = this.matchConfigName(this.emitColumnConfig());
    if (name !== null) this.newConfigName.set(name);
    this.popperSaveToLocal.set(false);
  }
}
