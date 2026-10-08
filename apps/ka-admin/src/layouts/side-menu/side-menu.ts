import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  effect,
  inject,
  Injector,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { filter, map } from 'rxjs';

import {
  collectOpenKeysForPath,
  mapChildren,
  type SideMenuItem,
  type SideMenuNode,
} from './side-menu-tree';

export type { SideMenuNode } from './side-menu-tree';

function currentPathname(router: Router): string {
  return router.url.split(/[?#]/)[0] || '/';
}

/** 递归模板按声明位置取注入器；子菜单项须拿到所在 nz-submenu 的注入器才能算层级 */
@Directive({ selector: '[kaMenuInjector]', exportAs: 'kaMenuInjector' })
export class MenuInjector {
  readonly injector = inject(Injector);
}

@Component({
  selector: 'ka-side-menu',
  imports: [MenuInjector, NgTemplateOutlet, NzIconModule, NzMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ul
      class="side-menu"
      nz-menu
      nzMode="inline"
      nzTheme="dark"
    >
      <ng-container
        [ngTemplateOutlet]="itemsTpl"
        [ngTemplateOutletContext]="{ $implicit: items() }"
      />

      <ng-template
        #itemsTpl
        let-list
      >
        @for (item of list; track item.key) {
          @if (item.children?.length) {
            <li
              #sub="kaMenuInjector"
              nz-submenu
              kaMenuInjector
              [nzTitle]="item.label"
              [nzIcon]="item.icon || null"
              [nzOpen]="isOpen(item.key)"
              (nzOpenChange)="toggleOpen(item.key, $event)"
            >
              <ul>
                <ng-container
                  [ngTemplateOutlet]="itemsTpl"
                  [ngTemplateOutletContext]="{ $implicit: item.children }"
                  [ngTemplateOutletInjector]="sub.injector"
                />
              </ul>
            </li>
          } @else {
            <li
              nz-menu-item
              [nzSelected]="pathname() === item.key"
              (click)="navigate(item.key)"
            >
              @if (item.icon) {
                <nz-icon [nzType]="item.icon" />
              }
              <span>{{ item.label }}</span>
            </li>
          }
        }
      </ng-template>
    </ul>
  `,
})
export class SideMenu {
  readonly menus = input.required<SideMenuNode[]>();

  private readonly router = inject(Router);

  protected readonly pathname = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => currentPathname(this.router)),
    ),
    { initialValue: currentPathname(this.router) },
  );

  protected readonly items = computed<SideMenuItem[]>(() =>
    this.menus().map((group) => ({
      key: group.path,
      icon: group.icon,
      label: group.title,
      children: mapChildren(group.children),
    })),
  );

  private readonly openKeys = signal<string[]>([]);

  constructor() {
    effect(() => {
      this.openKeys.set(collectOpenKeysForPath(this.menus(), this.pathname()));
    });
  }

  protected isOpen(key: string) {
    return this.openKeys().includes(key);
  }

  protected toggleOpen(key: string, open: boolean) {
    this.openKeys.update((keys) =>
      open ? [...new Set([...keys, key])] : keys.filter((k) => k !== key),
    );
  }

  protected navigate(path: string) {
    if (path.startsWith('/')) void this.router.navigateByUrl(path);
  }
}
