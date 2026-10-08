import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SideMenu } from '@/layouts/side-menu/side-menu';
import type { SideMenuNode } from '@/layouts/side-menu/side-menu-tree';

/**
 * 业务域壳：左侧菜单 + 右侧子路由（对齐 kr `DomainModuleShell` / kv3）。
 * 根路径 → 首个叶子页的跳转由域路由 `redirectTo: firstLeafPath(menus[0])` 声明。
 */
@Component({
  selector: 'ka-domain-module-shell',
  imports: [RouterOutlet, SideMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <main class="domain-module-shell">
      <aside class="domain-module-aside">
        <div class="domain-module-aside-body">
          <ka-side-menu [menus]="menus()" />
        </div>
      </aside>
      <div class="domain-module-main">
        <router-outlet />
      </div>
    </main>
  `,
})
export class DomainModuleShell {
  readonly menus = input.required<SideMenuNode[]>();
}
