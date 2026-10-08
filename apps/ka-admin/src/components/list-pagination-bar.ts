import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';

/** 列表底部分页条：对齐 kv3 BasePagination（refresh, total, prev, pager, next, jumper, sizes） */
@Component({
  selector: 'ka-list-pagination-bar',
  imports: [
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzPaginationModule,
    NzSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (showPager() || enableRefresh()) {
      <div
        class="table-pagination-bar"
        role="navigation"
        aria-label="分页导航"
      >
        @if (enableRefresh()) {
          <button
            nz-button
            class="do-pagination-refresh"
            aria-label="刷新"
            title="刷新"
            [nzLoading]="loading()"
            (click)="refresh.emit()"
          >
            <nz-icon nzType="sync" />
          </button>
        }
        @if (showPager()) {
          <nz-pagination
            [nzPageIndex]="pageNum()"
            [nzPageSize]="pageSize()"
            [nzTotal]="total()"
            [nzShowTotal]="totalTpl"
            (nzPageIndexChange)="pageChange.emit($event)"
          />
          <ng-template
            #totalTpl
            let-total
          >
            共 {{ total }} 条
          </ng-template>
          <span class="do-pagination-jump">
            前往
            <input
              nz-input
              inputmode="numeric"
              aria-label="页码"
              [value]="draft() ?? pageNum()"
              (input)="onDraft($event)"
              (blur)="commitJump()"
              (keydown.enter)="commitJump()"
            />
            页
          </span>
          <nz-select
            class="do-pagination-sizes"
            aria-label="每页条数"
            [ngModel]="pageSize()"
            (ngModelChange)="sizeChange.emit($event)"
          >
            @for (size of pageSizeOptions(); track size) {
              <nz-option
                [nzValue]="size"
                [nzLabel]="size + '条/页'"
              />
            }
          </nz-select>
        }
      </div>
    }
  `,
})
export class ListPaginationBar {
  readonly pageNum = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly loading = input(false);
  readonly pageSizeOptions = input<number[]>([10, 20, 50]);
  /** true 即显示刷新按钮（对齐 kv3 BasePagination enable-refresh） */
  readonly enableRefresh = input(false);
  readonly pageChange = output<number>();
  readonly sizeChange = output<number>();
  readonly refresh = output<void>();

  protected readonly showPager = computed(() => this.total() > 0);
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  /** el-pagination jumper：始终显示当前页，失焦/回车时钳到 [1, pageCount] 再跳 */
  protected readonly draft = signal<string | null>(null);

  protected onDraft(event: Event) {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '');
    el.value = digits;
    this.draft.set(digits);
  }

  protected commitJump() {
    const draft = this.draft();
    if (draft === null) return;
    const n = Number.parseInt(draft, 10);
    const next = Number.isNaN(n) || n < 1 ? 1 : Math.min(n, this.pageCount());
    this.draft.set(null);
    if (next !== this.pageNum()) this.pageChange.emit(next);
  }
}
