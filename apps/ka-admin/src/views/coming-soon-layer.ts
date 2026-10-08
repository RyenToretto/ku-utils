import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import type { AppRouteData } from '@/types/route-data';

/** 未建设页面占位，对齐 kv3 / kr `ComingSoonLayer`。 */
@Component({
  selector: 'ka-coming-soon-layer',
  imports: [NzEmptyModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-coming-soon' },
  template: `
    <nz-empty
      [nzNotFoundImage]="badge"
      [nzNotFoundContent]="title() + ' · 页面建设中，欢迎认领开发'"
      [nzNotFoundFooter]="meta"
    />
    <ng-template #badge>
      <div
        class="page-coming-soon-badge"
        style="margin: 0 auto"
      >
        Coming Soon
      </div>
    </ng-template>
    <ng-template #meta>
      <div class="page-coming-soon-meta">
        @if (permission()) {
          <p>
            权限 Key：
            <code>{{ permission() }}</code>
          </p>
        }
        <p>
          负责人：
          <strong>{{ owner }}</strong>
        </p>
      </div>
    </ng-template>
  `,
})
export default class ComingSoonLayer {
  private readonly data = toSignal(inject(ActivatedRoute).data, {
    initialValue: {} as AppRouteData,
  });
  protected readonly title = computed(() => String((this.data() as AppRouteData).title || '功能'));
  protected readonly permission = computed(() =>
    String((this.data() as AppRouteData).permission || ''),
  );
  protected readonly owner = '待认领';
}
