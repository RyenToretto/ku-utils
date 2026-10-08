import {
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getTextLength } from '@ku-utils/utils';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpaceModule } from 'ng-zorro-antd/space';

function cutByVisualLength(text: string, maxLen: number) {
  if (getTextLength(text) <= maxLen) return text;
  let len = 0;
  let result = '';
  for (const ch of text) {
    const chLen = getTextLength(ch);
    if (len + chLen > maxLen) break;
    len += chLen;
    result += ch;
  }
  return result;
}

/** 关键词标签录入 + 推荐词（对齐 kv3 DoWordsTag：aside 复选 / inline 芯片）。 */
@Component({
  selector: 'ka-do-words-tag',
  imports: [FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzSpaceModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'do-words-tag',
    '[class.is-inline-recommend]': "recommendLayout() === 'inline'",
  },
  template: `
    <div class="do-words-tag-layer">
      <div class="do-words-tag-panel">
        <nz-space-compact
          nzBlock
          class="do-words-tag-header"
        >
          <nz-input-wrapper nzAllowClear>
            <input
              #draftInput
              nz-input
              [disabled]="isAtMax()"
              [placeholder]="placeholder()"
              [ngModel]="draft()"
              (ngModelChange)="onDraftInput($event ?? '')"
              (keydown.enter)="addFromInput()"
            />
          </nz-input-wrapper>
          <button
            nz-button
            [disabled]="isAtMax()"
            (click)="addFromInput()"
          >
            添加(回车键)
          </button>
        </nz-space-compact>

        @if (showRecommends() && recommendLayout() === 'inline') {
          <div class="do-words-tag-recommend-inline">
            <span class="do-words-tag-recommend-inline-label">推荐{{ tipsMain() }}</span>
            <div class="do-words-tag-recommend-inline-list">
              @for (item of recommends(); track $index) {
                <span
                  class="do-words-tag-recommend-chip"
                  [class.is-active]="tagList().includes(item)"
                  role="button"
                  tabindex="0"
                  (click)="toggleTag(item)"
                  (keyup.enter)="toggleTag(item)"
                >
                  {{ item }}
                </span>
              }
            </div>
          </div>
        }

        <div class="do-words-tag-body">
          <div class="do-words-tag-card">
            <div class="do-words-tag-card-hd">
              <div class="do-words-tag-card-hd-left">
                <span class="do-words-tag-main-tips">已添加{{ tipsMain() }}</span>
                @if (maxCount() > 0) {
                  <span class="do-words-tag-count-tips">
                    {{ tagList().length }}/{{ maxCount() }}
                  </span>
                }
              </div>
              <button
                type="button"
                class="do-words-tag-clear-btn"
                (click)="clearTags()"
              >
                <span>清空</span>
                <nz-icon nzType="reload" />
              </button>
            </div>
            <div class="do-words-tag-chosen-list">
              @for (tag of tagList(); track $index) {
                <div class="do-words-tag-chosen-item">
                  <div
                    class="do-words-tag-chosen-cell"
                    [title]="tag"
                  >
                    <span>{{ tag }}</span>
                    <button
                      type="button"
                      class="do-words-tag-chosen-remove"
                      aria-label="移除"
                      (click)="removeAt($index)"
                    >
                      <nz-icon nzType="close" />
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      @if (showRecommends() && recommendLayout() === 'aside') {
        <div class="do-words-tag-aside">
          <div class="do-words-tag-recommend-title">推荐{{ tipsMain() }}：</div>
          <div class="do-words-tag-recommend-card">
            <div class="do-words-tag-recommend-scroller">
              @for (item of recommends(); track $index) {
                @let active = tagList().includes(item);
                <div
                  class="do-words-tag-recommend-item"
                  [class.is-active]="active"
                  (click)="toggleTag(item)"
                >
                  <span
                    class="do-words-tag-recommend-check"
                    [class.is-active]="active"
                  >
                    @if (active) {
                      <nz-icon nzType="check" />
                    }
                  </span>
                  <span class="do-words-tag-recommend-label">{{ item }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DoWordsTag {
  readonly value = input<string[] | null>();
  readonly tipsMain = input('标签');
  readonly max = input(10);
  readonly tagLength = input(9);
  readonly minTagLength = input(0);
  readonly recommends = input<string[]>([]);
  readonly recommendLayout = input<'aside' | 'inline'>('aside');
  readonly valueChange = output<string[]>();

  private readonly message = inject(NzMessageService);
  private readonly draftInput = viewChild<ElementRef<HTMLInputElement>>('draftInput');
  protected readonly draft = signal('');

  protected readonly tagList = computed(() => this.value() ?? []);
  protected readonly maxCount = computed(() => Math.max(this.max(), 0));
  private readonly maxTagLength = computed(() => Math.max(this.tagLength(), 0));
  private readonly minLength = computed(() => Math.max(this.minTagLength(), 0));
  protected readonly isAtMax = computed(
    () => this.maxCount() > 0 && this.tagList().length >= this.maxCount(),
  );
  protected readonly showRecommends = computed(() => this.recommends().length > 0);
  protected readonly placeholder = computed(() => {
    if (this.isAtMax()) return `最多添加${this.maxCount()}个${this.tipsMain()}`;
    if (this.tipsMain() && this.maxTagLength() > 0) {
      return `每个${this.tipsMain()}最多${this.maxTagLength()}个字符`;
    }
    return '请输入';
  });

  protected onDraftInput(text: string) {
    const maxLen = this.maxTagLength();
    const next = maxLen ? cutByVisualLength(text, maxLen) : text;
    this.draft.set(next);
    const el = this.draftInput()?.nativeElement;
    if (el && el.value !== next) el.value = next;
  }

  private focusInput() {
    this.draftInput()?.nativeElement.focus();
  }

  protected removeAt(index: number) {
    if (index < 0) return;
    this.valueChange.emit(this.tagList().filter((_, i) => i !== index));
  }

  private addTag(raw: string, options?: { fromInput?: boolean; toggle?: boolean }) {
    const text = (raw || '').trim();
    if (!text) return;

    if (options?.fromInput) {
      const len = getTextLength(text);
      if (this.maxTagLength() > 0 && len > this.maxTagLength()) {
        this.message.warning(`长度必须小于等于${this.maxTagLength()}`);
        this.focusInput();
        return;
      }
      if (this.minLength() > 0 && len < this.minLength()) {
        this.message.warning(`长度必须大于等于${this.minLength()}`);
        this.focusInput();
        return;
      }
      this.draft.set('');
      this.focusInput();
    }

    const tagList = this.tagList();
    const foundIndex = tagList.indexOf(text);
    if (foundIndex >= 0) {
      if (options?.toggle) this.removeAt(foundIndex);
      return;
    }

    if (this.isAtMax()) {
      this.message.warning(`最多添加${this.maxCount()}个${this.tipsMain()}`);
      return;
    }

    this.valueChange.emit([...tagList, text]);
  }

  protected addFromInput() {
    this.addTag(this.draft(), { fromInput: true });
  }

  protected toggleTag(text: string) {
    this.addTag(text, { toggle: true });
  }

  protected clearTags() {
    if (!this.tagList().length) return;
    this.valueChange.emit([]);
  }
}
