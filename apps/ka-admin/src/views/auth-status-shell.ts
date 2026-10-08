import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { doEnv } from '@/utils/env';

export type AuthStatusTone = 'warning' | 'success' | 'danger' | 'info';

/**
 * SSO 状态页外壳（对齐 kr `AuthStatusShell`）。
 * 内容投影：`[authIcon]` 图标、`[authMeta]` 附加信息、`[authActions]` 按钮区。
 */
@Component({
  selector: 'ka-auth-status-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="page-auth-status">
      <div
        class="page-auth-status-atmosphere"
        aria-hidden="true"
      ></div>
      <section
        class="page-auth-status-panel"
        [class]="'tone-' + iconTone()"
        [attr.role]="role()"
        [attr.aria-labelledby]="titleId()"
      >
        <header class="page-auth-status-brand">
          <span class="page-auth-status-mark">◆</span>
          <div class="page-auth-status-brand-text">
            <span class="page-auth-status-brand-name">{{ projectName }}</span>
            <span class="page-auth-status-brand-sub">投放工作台</span>
          </div>
        </header>
        <div
          class="page-auth-status-icon"
          [class]="'tone-' + iconTone()"
          aria-hidden="true"
        >
          <ng-content select="[authIcon]" />
        </div>
        <h1
          class="page-auth-status-title"
          [id]="titleId()"
        >
          {{ title() }}
        </h1>
        @if (desc()) {
          <p class="page-auth-status-desc">{{ desc() }}</p>
        }
        <ng-content select="[authMeta]" />
        <div class="page-auth-status-actions">
          <ng-content select="[authActions]" />
        </div>
        <p class="page-auth-status-hint">会话由统一认证托管，本系统不保存登录口令</p>
      </section>
    </main>
  `,
})
export class AuthStatusShell {
  readonly titleId = input.required<string>();
  readonly iconTone = input<AuthStatusTone>('info');
  readonly role = input('status');
  readonly title = input.required<string>();
  readonly desc = input('');

  protected readonly projectName = doEnv.projectName;
}
