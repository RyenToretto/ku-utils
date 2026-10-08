import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { AppearancePicker } from './appearance-picker';

import type { ThemeMode } from '@/utils/theme';

const THEME_LABELS: Record<ThemeMode, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
};

/**
 * 顶栏账户菜单（对齐 kr `HeaderProfileMenu` / kv3）：头像 → 账户浮层；「外观」→ 左侧二级浮层。
 * 二级浮层是独立 CDK overlay，点击其内部不会被账户浮层当成外部点击。
 */
@Component({
  selector: 'ka-header-profile-menu',
  imports: [AppearancePicker, NzAvatarModule, NzIconModule, NzPopoverModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'header-profile' },
  template: `
    <button
      type="button"
      class="profile-avatar-btn header-profile-trigger"
      aria-label="打开账户菜单"
      nz-popover
      nzPopoverTrigger="click"
      nzPopoverPlacement="bottomRight"
      nzPopoverOverlayClassName="profile-menu-popover"
      [nzPopoverArrowPointAtCenter]="false"
      [nzPopoverContent]="menuTpl"
      [nzPopoverVisible]="profileOpen()"
      (nzPopoverVisibleChange)="onProfileVisibleChange($event)"
    >
      <nz-avatar
        class="profile-avatar"
        [nzSize]="36"
        [nzText]="initial()"
      />
    </button>

    <ng-template #menuTpl>
      <div class="profile-menu">
        <div class="profile-menu-hd">
          <nz-avatar
            class="profile-menu-avatar profile-avatar"
            [nzSize]="38"
            [nzText]="initial()"
          />
          <div class="profile-menu-meta">
            <span class="profile-menu-name">{{ displayName() }}</span>
            <span class="profile-menu-role">{{ role() }}</span>
          </div>
        </div>

        <div class="profile-menu-divider"></div>

        <button
          type="button"
          class="profile-menu-item is-appearance"
          [class.is-active]="appearanceOpen()"
          nz-popover
          [nzPopoverTrigger]="null"
          nzPopoverPlacement="leftTop"
          nzPopoverOverlayClassName="appearance-menu-popover"
          [nzPopoverContent]="appearanceTpl"
          [nzPopoverVisible]="appearanceOpen()"
          (nzPopoverVisibleChange)="appearanceOpen.set($event)"
          (click)="appearanceOpen.set(true)"
        >
          <nz-icon nzType="sun" />
          <span>外观</span>
          <span class="profile-menu-item-value">{{ appearanceLabel() }}</span>
          <nz-icon
            class="profile-menu-item-arrow"
            nzType="arrow-right"
          />
        </button>

        <button
          type="button"
          class="profile-menu-item"
          (click)="handleLogout()"
        >
          <nz-icon nzType="logout" />
          <span>退出登录</span>
        </button>
      </div>
    </ng-template>

    <ng-template #appearanceTpl>
      <div
        class="appearance-menu-popover-inner"
        role="dialog"
        aria-label="外观"
      >
        <ka-appearance-picker
          [value]="theme()"
          (valueChange)="handleSetTheme($event)"
        />
      </div>
    </ng-template>
  `,
})
export class HeaderProfileMenu {
  readonly initial = input.required<string>();
  readonly displayName = input.required<string>();
  readonly role = input.required<string>();
  readonly theme = input.required<ThemeMode>();
  readonly logout = output<void>();
  readonly setTheme = output<ThemeMode>();

  protected readonly profileOpen = signal(false);
  protected readonly appearanceOpen = signal(false);
  protected readonly appearanceLabel = computed(
    () => THEME_LABELS[this.theme()] || THEME_LABELS.system,
  );

  protected onProfileVisibleChange(open: boolean) {
    this.profileOpen.set(open);
    if (!open) this.appearanceOpen.set(false);
  }

  /** 与 kv3 closeMenus 对齐：同步收起两层 */
  private closeMenus() {
    this.appearanceOpen.set(false);
    this.profileOpen.set(false);
  }

  protected handleSetTheme(mode: ThemeMode) {
    this.setTheme.emit(mode);
    this.closeMenus();
  }

  protected handleLogout() {
    this.closeMenus();
    this.logout.emit();
  }
}
