import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  type ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

const PANEL_GAP = 18;

/**
 * 列表筛选面板：按行折叠 + 右下角操作区，对齐 kv3 `DoFilterPanel.vue`。
 * 筛选项写成 `.do-filter-field > .do-filter-field-label + 控件`；额外按钮投影到 `[filterCtl]`。
 */
@Component({
  selector: 'ka-do-filter-panel',
  imports: [NzButtonModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'do-filter-panel',
    '[class.active]': '!isFold()',
    '[class.can-fold]': 'canFold()',
    '[class.has-ctl]': '!hideSearch()',
    '[style.--do-filter-label-width]': 'resolvedLabelWidth()',
  },
  template: `
    <div class="do-filter-box">
      <div class="do-filter-body">
        <div
          class="do-filter-wrapper"
          [style.height]="wrapperHeight()"
        >
          <div
            #content
            class="do-filter-content"
          >
            <ng-content />
          </div>
        </div>
        @if (canFold()) {
          <button
            type="button"
            class="more-filter-option"
            [attr.aria-expanded]="!isFold()"
            (click)="isFold.set(!isFold())"
          >
            <nz-icon [nzType]="isFold() ? 'down' : 'up'" />
            <span>{{ isFold() ? '更多筛选' : '收起筛选' }}</span>
          </button>
        }
      </div>
      @if (!hideSearch()) {
        <div
          class="do-filter-ctl"
          [style.max-width]="maxCtlWidth()"
        >
          <button
            nz-button
            nzType="primary"
            [nzLoading]="loading()"
            [disabled]="loading()"
            (click)="onSearchClick()"
          >
            {{ mainText() }}
          </button>
          <ng-content select="[filterCtl]" />
        </div>
      }
    </div>
  `,
})
export class DoFilterPanel {
  readonly line = input(2);
  /** 分组式筛选 / 含非表单节点时关掉按行折叠，交给内容自然撑开 */
  readonly disableFold = input(false);
  readonly eachLineHeight = input(52);
  /** 筛选项标签宽度（px，含右侧 12px 间距）；'auto' 取最宽标签，对齐 kv3 el-form label-width */
  readonly labelWidth = input<number | 'auto'>();
  readonly maxCtlWidth = input<string>();
  readonly hideSearch = input(false);
  readonly mainText = input('搜索');
  readonly loading = input(false);
  readonly searchClick = output<boolean>();

  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  protected readonly isFold = signal(true);
  private readonly lineCount = signal<number | null>(null);
  private readonly autoLabelWidth = signal<number | undefined>(undefined);

  protected readonly canFold = computed(
    () => !this.disableFold() && (this.lineCount() ?? this.line()) > this.line(),
  );
  protected readonly wrapperHeight = computed(() => {
    if (this.disableFold()) return 'auto';
    const lines = this.canFold() && this.isFold() ? this.line() : (this.lineCount() ?? this.line());
    return `${lines * this.eachLineHeight() - PANEL_GAP}px`;
  });
  protected readonly resolvedLabelWidth = computed(() => {
    const labelWidth = this.labelWidth();
    const width = labelWidth === 'auto' ? this.autoLabelWidth() : labelWidth;
    return width != null ? `${width}px` : null;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const el = this.content().nativeElement;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const measure = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.lineCount.set(Math.round(el.clientHeight / this.eachLineHeight()));
        }, 300);
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      destroyRef.onDestroy(() => {
        clearTimeout(timer);
        ro.disconnect();
      });
    });

    let labelObserver: MutationObserver | null = null;
    destroyRef.onDestroy(() => labelObserver?.disconnect());
    effect(() => {
      const auto = this.labelWidth() === 'auto';
      const el = this.content().nativeElement;
      untracked(() => {
        labelObserver?.disconnect();
        labelObserver = null;
        if (!auto) return;
        // el-form label-width="auto"：所有标签取文字自然宽度 + 右内距的最大值
        const measure = () => {
          const range = document.createRange();
          let max = 0;
          el.querySelectorAll<HTMLElement>('.do-filter-field-label').forEach((label) => {
            range.selectNodeContents(label);
            const pad = Number.parseFloat(getComputedStyle(label).paddingRight) || 0;
            max = Math.max(max, Math.ceil(range.getBoundingClientRect().width + pad));
          });
          this.autoLabelWidth.set(max || undefined);
        };
        measure();
        void document.fonts?.ready.then(measure);
        labelObserver = new MutationObserver(measure);
        labelObserver.observe(el, { childList: true, subtree: true, characterData: true });
      });
    });
  }

  protected onSearchClick() {
    if (!this.loading()) this.searchClick.emit(true);
  }
}
