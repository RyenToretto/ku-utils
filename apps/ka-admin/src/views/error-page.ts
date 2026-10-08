import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AccountAccessTip } from './account-access-tip';

@Component({
  selector: 'ka-error-page',
  imports: [AccountAccessTip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ka-account-access-tip
      title="页面异常"
      description="资源加载失败或发生未知错误。可尝试重新登录，或联系管理员排查。"
      [code]="code()"
    />
  `,
})
export default class ErrorPage {
  readonly code = input<string | number | null>(null);
}
