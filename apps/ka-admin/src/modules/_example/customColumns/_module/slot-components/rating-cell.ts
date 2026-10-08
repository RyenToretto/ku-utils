import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

const STAR_COUNT = 5;

/** 只读评分：与 el-rate disabled 一致按小数精确填充（nz-rate 只能整/半星） */
@Component({
  selector: 'ka-rating-cell',
  imports: [NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rating-cell">
      <span
        class="do-rate"
        role="img"
        [attr.aria-label]="'评分 ' + score()"
      >
        @for (fill of fills(); track $index) {
          <span class="do-rate-item">
            <nz-icon
              nzType="star"
              nzTheme="fill"
            />
            @if (fill > 0) {
              <span
                class="do-rate-fill"
                [style.width.%]="fill * 100"
              >
                <nz-icon
                  nzType="star"
                  nzTheme="fill"
                />
              </span>
            }
          </span>
        }
      </span>
    </div>
  `,
})
export class RatingCell {
  readonly row = input.required<Record<string, unknown>>();

  protected readonly score = computed(() =>
    Math.min(STAR_COUNT, Number(this.row()['score'] || 0) / 20),
  );

  protected readonly fills = computed(() => {
    const score = this.score();
    return Array.from({ length: STAR_COUNT }, (_, i) => Math.max(0, Math.min(1, score - i)));
  });
}
