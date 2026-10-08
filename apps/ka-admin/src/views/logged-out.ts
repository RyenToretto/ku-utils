import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { AuthStatusShell } from './auth-status-shell';

import { buildLoginUrl } from '@/utils/auth-redirect';

@Component({
  selector: 'ka-logged-out',
  imports: [AuthStatusShell, NzButtonModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ka-auth-status-shell
      titleId="logged-out-title"
      iconTone="success"
      role="status"
      title="已退出登录"
      desc="会话已安全退出。重新登录后将回到工作台。"
    >
      <nz-icon
        nzType="check-circle"
        nzTheme="outline"
        style="font-size: 32px"
        authIcon
      />
      <button
        nz-button
        nzType="primary"
        type="button"
        authActions
        (click)="relogin()"
      >
        重新登录
      </button>
    </ka-auth-status-shell>
  `,
})
export default class LoggedOut {
  protected relogin() {
    window.location.href = buildLoginUrl('/');
  }
}
