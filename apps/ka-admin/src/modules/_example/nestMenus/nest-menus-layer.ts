import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

/** 多级导航叶子页：`title` / `nestTrail` / `nestLevel` 来自路由 data（组件输入绑定） */
@Component({
  selector: 'ka-nest-menus-layer',
  imports: [NzBreadCrumbModule, NzCardModule, NzTypographyModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-nest-menus' },
  template: `
    <nz-breadcrumb [style.margin-bottom.px]="16">
      @for (item of trail(); track $index) {
        <nz-breadcrumb-item>{{ item }}</nz-breadcrumb-item>
      }
    </nz-breadcrumb>
    <nz-card>
      <h4
        nz-typography
        [style.margin-top.px]="0"
      >
        {{ title() || '多级导航叶子' }}
      </h4>
      <div
        nz-typography
        nzType="secondary"
      >
        本页用于验证侧栏多级展开与路由叶子标题同步。当前层级：{{ nestLevel() ?? trail().length }}
      </div>
    </nz-card>
  `,
})
export default class NestMenusLayer {
  readonly title = input<string>();
  readonly nestLevel = input<number>();
  readonly nestTrail = input<string[]>();
  protected readonly trail = computed(() => this.nestTrail() ?? [this.title() || '页面']);
}
