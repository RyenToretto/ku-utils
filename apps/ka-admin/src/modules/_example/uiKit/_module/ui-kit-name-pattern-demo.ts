import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';

import { DoNamePattern } from '@/components/do-name-pattern';

const PATTERN_LIST = ['{应用名}', '{日期}', '{时分秒}', '{动态标号}'];

@Component({
  selector: 'ka-ui-kit-name-pattern-demo',
  imports: [DoNamePattern, NzCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-ui-kit-name-pattern' },
  template: `
    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>底栏芯片（默认）</h3>
      <ka-do-name-pattern
        [value]="patternBottom()"
        [patternList]="patternList"
        (valueChange)="patternBottom.set($event)"
      />
      <p class="ui-kit-demo-hint">{{ patternBottom() || '—' }}</p>
    </nz-card>

    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>浮层插入</h3>
      <ka-do-name-pattern
        [style.max-width.px]="420"
        [value]="patternPopover()"
        [usePopover]="true"
        [patternList]="patternList"
        (valueChange)="patternPopover.set($event)"
      />
      <p class="ui-kit-demo-hint">{{ patternPopover() || '—' }}</p>
    </nz-card>

    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>textarea + useOnly</h3>
      <ka-do-name-pattern
        [value]="patternTextarea()"
        [textarea]="true"
        [useOnly]="true"
        [patternList]="patternList"
        (valueChange)="patternTextarea.set($event)"
      />
      <p class="ui-kit-demo-hint">{{ patternTextarea() || '—' }}</p>
    </nz-card>
  `,
})
export default class UiKitNamePatternDemo {
  protected readonly patternList = PATTERN_LIST;
  protected readonly patternBottom = signal('{应用名}-{日期}-{动态标号}');
  protected readonly patternPopover = signal('');
  protected readonly patternTextarea = signal('{应用名}-{日期}');
}
