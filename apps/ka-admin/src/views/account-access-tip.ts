import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { AuthStatusShell } from './auth-status-shell';

@Component({
  selector: 'ka-account-access-tip',
  imports: [AuthStatusShell, NzButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ka-auth-status-shell
      titleId="account-access-tip"
      iconTone="danger"
      [title]="title()"
      [desc]="description()"
    >
      @if (codeLabel()) {
        <p
          class="page-account-exception-meta"
          authMeta
        >
          <span class="page-account-exception-chip">异常码 {{ codeLabel() }}</span>
        </p>
      }
      <button
        nz-button
        nzType="primary"
        type="button"
        authActions
        (click)="reload()"
      >
        刷新页面
      </button>
    </ka-auth-status-shell>
  `,
})
export class AccountAccessTip {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly code = input<string | number | null>(null);

  protected readonly codeLabel = computed(() => {
    const code = this.code();
    return code != null && code !== '' ? String(code) : '';
  });

  protected reload() {
    window.location.reload();
  }
}
