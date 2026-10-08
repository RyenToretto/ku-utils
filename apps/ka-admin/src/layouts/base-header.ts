import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import headerExampleTab from './header-example-tab-entry';

import { HeaderProfileMenu } from '@/components/header-profile-menu';
import { AdminVersionLogo } from '@/layouts/admin-version-logo';
import { AppStore } from '@/stores/app';
import { UserStore } from '@/stores/user';
import { submitLogout } from '@/utils/auth-redirect';

@Component({
  selector: 'ka-fallback-example-tab',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <a
      class="base-header-link header-example-tab"
      routerLink="/example"
      routerLinkActive="is-active"
    >
      Demo
    </a>
  `,
})
class FallbackExampleTab {}

@Component({
  selector: 'ka-base-header',
  imports: [AdminVersionLogo, HeaderProfileMenu, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <header class="base-header">
      <div class="base-header-inner">
        <ka-admin-version-logo
          [hasUpdate]="hasUpdate()"
          (refresh)="refresh.emit()"
        />
        <nav class="base-header-menus">
          <ng-container *ngComponentOutlet="navTab" />
        </nav>
        <div class="base-header-right">
          <ka-header-profile-menu
            [initial]="userInitial()"
            [displayName]="displayName()"
            [role]="userRole()"
            [theme]="appStore.theme()"
            (logout)="logout()"
            (setTheme)="appStore.setTheme($event)"
          />
        </div>
      </div>
    </header>
  `,
})
export class BaseHeader {
  readonly hasUpdate = input(false);
  readonly refresh = output<void>();

  protected readonly appStore = inject(AppStore);
  private readonly userStore = inject(UserStore);

  protected readonly navTab = headerExampleTab ?? FallbackExampleTab;
  protected readonly displayName = computed(
    () => this.userStore.nickName() || this.userStore.name() || '未登录',
  );
  protected readonly userInitial = computed(() => this.displayName().charAt(0).toUpperCase());
  protected readonly userRole = computed(() => this.userStore.mail() || '账户');

  protected logout() {
    submitLogout('logged-out');
  }
}
