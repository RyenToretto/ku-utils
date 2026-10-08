import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthStatusShell } from './auth-status-shell';

import { MODULE_PERMISSION_KEYS } from '@/maps/common/dsp-permission';
import { resolveBusinessHomePath } from '@/router/paths';
import { UserStore } from '@/stores/user';
import { submitLogout } from '@/utils/auth-redirect';

@Component({
  selector: 'ka-account-exception',
  imports: [AuthStatusShell, NzButtonModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ka-auth-status-shell
      titleId="account-exception-title"
      iconTone="warning"
      role="alert"
      title="账号异常或无权限"
      desc="登录已成功，但当前账号异常、尚未开通或缺少投放权限。可重试刷新状态，或切换其他账号。"
    >
      <nz-icon
        nzType="lock"
        nzTheme="outline"
        style="font-size: 32px"
        authIcon
      />
      @if (codeLabel() || detailLabel()) {
        <p
          class="page-account-exception-meta"
          authMeta
        >
          @if (codeLabel()) {
            <span class="page-account-exception-chip">异常码 {{ codeLabel() }}</span>
          }
          @if (detailLabel()) {
            <span class="page-account-exception-chip-detail">{{ detailLabel() }}</span>
          }
        </p>
      }
      <ng-container authActions>
        <button
          nz-button
          nzType="primary"
          type="button"
          [nzLoading]="retryLoading()"
          [disabled]="switchLoading()"
          (click)="handleRetry()"
        >
          重试
        </button>
        <button
          nz-button
          type="button"
          [nzLoading]="switchLoading()"
          [disabled]="retryLoading()"
          (click)="handleSwitchAccount()"
        >
          切换账号
        </button>
      </ng-container>
    </ka-auth-status-shell>
  `,
})
export default class AccountException {
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);
  private readonly userStore = inject(UserStore);

  protected readonly retryLoading = signal(false);
  protected readonly switchLoading = signal(false);

  protected readonly codeLabel = computed(() => {
    const code = this.userStore.accessDenied()?.code;
    return code === undefined || code === null || code === '' ? '' : String(code);
  });
  protected readonly detailLabel = computed(() => this.userStore.accessDenied()?.detail || '');

  protected async handleRetry() {
    this.retryLoading.set(true);
    try {
      await this.userStore.fetchUserInfo();
      const ok = MODULE_PERMISSION_KEYS.some((key) => this.userStore.hasPermission(key));
      if (!ok) {
        this.userStore.markNoPermissionDenied();
        this.message.warning('当前账号仍无功能权限');
        return;
      }
      await this.router.navigateByUrl(resolveBusinessHomePath(), { replaceUrl: true });
    } catch {
      this.message.error('刷新账号状态失败');
    } finally {
      this.retryLoading.set(false);
    }
  }

  protected handleSwitchAccount() {
    this.switchLoading.set(true);
    this.userStore.clearSession();
    submitLogout('login');
  }
}
