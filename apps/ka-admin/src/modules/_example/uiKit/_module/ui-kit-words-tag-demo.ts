import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';

import { DoWordsTag } from '@/components/do-words-tag';

const RECOMMEND_LIST = ['新品', '促销', '高转化', '品牌词'];

@Component({
  selector: 'ka-ui-kit-words-tag-demo',
  imports: [DoWordsTag, NzCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-ui-kit-words-tag' },
  template: `
    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>侧栏推荐</h3>
      <ka-do-words-tag
        [value]="asideTags()"
        [max]="6"
        [tagLength]="12"
        [recommends]="recommendList"
        recommendLayout="aside"
        (valueChange)="asideTags.set($event)"
      />
      <p class="ui-kit-demo-hint">{{ asideTags().join(' / ') || '—' }}</p>
    </nz-card>

    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>行内推荐</h3>
      <ka-do-words-tag
        [value]="inlineTags()"
        tipsMain="可从推荐词快速添加；超出长度会截断提示。"
        [max]="5"
        [tagLength]="16"
        [recommends]="recommendList"
        recommendLayout="inline"
        (valueChange)="inlineTags.set($event)"
      />
      <p class="ui-kit-demo-hint">{{ inlineTags().join(' / ') || '—' }}</p>
    </nz-card>
  `,
})
export default class UiKitWordsTagDemo {
  protected readonly recommendList = RECOMMEND_LIST;
  protected readonly asideTags = signal<string[]>(['新品']);
  protected readonly inlineTags = signal<string[]>([]);
}
