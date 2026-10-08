import { inject } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';

export type ConfirmOptions = {
  title?: string;
  content: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onOk: () => void | Promise<void>;
};

/**
 * 二次确认弹窗（对齐 kr `modal.confirm`：实心警示图标、无关闭叉、垂直居中）。
 * 须在注入上下文调用；`onOk` 返回 Promise 时确定按钮自动 loading。
 */
export function injectConfirm() {
  const modal = inject(NzModalService);
  return (options: ConfirmOptions) =>
    modal.confirm({
      nzTitle: options.title ?? '提示',
      nzContent: options.content,
      nzIconType: 'exclamation-circle-fill',
      nzClosable: false,
      nzCentered: true,
      nzOkText: options.okText ?? '确定',
      nzCancelText: options.cancelText ?? '取消',
      nzOkDanger: options.danger,
      nzOnOk: options.onOk,
    });
}
