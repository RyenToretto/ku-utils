import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';

const DEFAULT_PATTERNS = ['{date}', '{time}', '{seq}'];
const DEFAULT_SPLIT_SIGN = '-';
const DEFAULT_TIP = '点击插入通配符；同一通配符默认可重复使用';

/** 命名模板插入器（对齐 kv3 DoNamePattern：底栏芯片 / 浮层 / useOnly）。 */
@Component({
  selector: 'ka-do-name-pattern',
  imports: [FormsModule, NzInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'do-name-pattern' },
  template: `
    <nz-input-wrapper [nzAllowClear]="clearable()">
      @if (textarea()) {
        <textarea
          #field
          nz-input
          rows="2"
          autocomplete="off"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [ngModel]="inner()"
          (ngModelChange)="valueChange.emit($event ?? '')"
          (click)="openPopover()"
          (focus)="openPopover()"
          (blur)="recordCursor()"
          (select)="recordCursor()"
          (keyup)="recordCursor()"
        ></textarea>
      } @else {
        <input
          #field
          nz-input
          autocomplete="off"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [ngModel]="inner()"
          (ngModelChange)="valueChange.emit($event ?? '')"
          (click)="openPopover()"
          (focus)="openPopover()"
          (blur)="recordCursor()"
          (select)="recordCursor()"
          (keyup)="recordCursor()"
        />
      }
    </nz-input-wrapper>
    @if (!usePopover() || popoverOpen()) {
      <div
        class="do-name-pattern-popover"
        [class.is-popover]="usePopover()"
        [class.bottom-list]="!usePopover()"
      >
        @if (usePopover()) {
          <div class="do-name-pattern-arrow"></div>
        }
        <div class="do-name-pattern-panel">
          <ul class="do-name-pattern-list">
            @for (token of tokens(); track token) {
              <li
                class="do-name-pattern-option"
                (mousedown)="$event.preventDefault()"
                (click)="choosePattern(token)"
              >
                <span class="do-name-pattern-token">{{ token }}</span>
              </li>
            }
          </ul>
          @if (tip()) {
            <div class="do-name-pattern-tip">{{ tip() }}</div>
          }
        </div>
      </div>
    }
  `,
})
export class DoNamePattern {
  readonly value = input<string | null | undefined>('');
  /** 可插入通配符；不传则用组件内默认列表 */
  readonly patternList = input<string[]>();
  readonly placeholder = input('请输入命名规则');
  readonly disabled = input(false);
  readonly clearable = input(true);
  /** 插入前自动补连接符（如 `-` / `_`） */
  readonly splitSign = input(DEFAULT_SPLIT_SIGN);
  /** 同一通配符仅允许出现一次 */
  readonly useOnly = input(false);
  /** true：浮层；false：输入框下方芯片列表 */
  readonly usePopover = input(false);
  readonly textarea = input(false);
  readonly tip = input(DEFAULT_TIP);
  readonly valueChange = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly field = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('field');
  protected readonly popoverOpen = signal(false);
  protected readonly tokens = computed(() => {
    const list = this.patternList();
    return list?.length ? list : DEFAULT_PATTERNS;
  });
  protected readonly inner = computed(() => this.value() ?? '');
  /** 未聚焦过输入框时为 null，插入落到末尾 */
  private cursor: number | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const onPointerDown = (e: PointerEvent) => {
      if (!this.host.nativeElement.contains(e.target as Node)) this.popoverOpen.set(false);
    };
    effect((onCleanup) => {
      if (!this.popoverOpen()) return;
      document.addEventListener('pointerdown', onPointerDown);
      onCleanup(() => document.removeEventListener('pointerdown', onPointerDown));
    });
    destroyRef.onDestroy(() => document.removeEventListener('pointerdown', onPointerDown));
  }

  protected recordCursor() {
    const el = this.field()?.nativeElement;
    if (el && typeof el.selectionStart === 'number') this.cursor = el.selectionStart;
  }

  private focusAt(pos: number) {
    requestAnimationFrame(() => {
      const el = this.field()?.nativeElement;
      if (!el) return;
      el.focus();
      el.setSelectionRange(pos, pos);
      this.cursor = pos;
    });
  }

  protected choosePattern(token: string) {
    if (this.disabled()) return;
    const inner = this.inner();
    if (!inner) {
      this.valueChange.emit(token);
      this.focusAt(token.length);
      return;
    }
    const cursor = this.cursor;
    const pos = cursor !== null && cursor <= inner.length ? cursor : inner.length;
    if (this.useOnly() && inner.includes(token)) {
      this.focusAt(pos);
      return;
    }
    const splitSign = this.splitSign();
    const before = inner.slice(0, pos);
    const after = inner.slice(pos);
    let insert =
      splitSign && pos > 0 && !before.endsWith(splitSign) ? `${splitSign}${token}` : token;
    if (splitSign && after.startsWith(splitSign) && insert.endsWith(splitSign)) {
      insert = insert.slice(0, -splitSign.length);
    }
    this.valueChange.emit(`${before}${insert}${after}`);
    this.focusAt(pos + insert.length);
  }

  protected openPopover() {
    this.recordCursor();
    if (this.usePopover() && !this.disabled() && this.tokens().length) this.popoverOpen.set(true);
  }
}
