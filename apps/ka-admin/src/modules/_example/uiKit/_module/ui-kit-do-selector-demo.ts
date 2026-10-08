import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';

import {
  DoSelector,
  type DoSelectorOption,
  type DoSelectorPayload,
  type DoSelectorValue,
} from '@/components/do-selector';

const CITY_OPTIONS = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '深圳', value: 'sz' },
];

function single(value: DoSelectorValue) {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

@Component({
  selector: 'ka-ui-kit-do-selector-demo',
  imports: [DoSelector, NzAlertModule, NzCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-ui-kit-do-selector' },
  template: `
    <nz-alert
      nzType="warning"
      nzShowIcon
      nzMessage="DoSelector 适合简单枚举 / 远程下拉；跨域选实体请用 XxxSelector。"
    />

    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>静态 options</h3>
      <ka-do-selector
        width="220px"
        placeholder="请选择"
        [value]="staticValue()"
        [options]="cityOptions"
        (valueChange)="staticValue.set(single($event))"
      />
      <p class="ui-kit-demo-hint">{{ staticValue() || '—' }}</p>
    </nz-card>

    <nz-card
      nzSize="small"
      class="ui-kit-demo-card"
    >
      <h3>远程 payload</h3>
      <ka-do-selector
        width="220px"
        placeholder="请选择"
        [value]="remoteValue()"
        [payload]="remotePayload"
        (valueChange)="remoteValue.set(single($event))"
        (selectChange)="onRemoteSelect($event)"
      />
      <p class="ui-kit-demo-hint">
        {{ remoteValue() || '—' }}{{ remoteLabel() ? ' / ' + remoteLabel() : '' }}
      </p>
    </nz-card>
  `,
})
export default class UiKitDoSelectorDemo {
  protected readonly cityOptions = CITY_OPTIONS;
  protected readonly single = single;
  protected readonly staticValue = signal<string | number | null>(null);
  protected readonly remoteValue = signal<string | number | null>(null);
  protected readonly remoteLabel = signal('');

  protected readonly remotePayload: DoSelectorPayload = {
    keyword: 'demo',
    requestFunc: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return CITY_OPTIONS;
    },
  };

  protected onRemoteSelect(option: DoSelectorOption | DoSelectorOption[] | null) {
    const one = Array.isArray(option) ? option[0] : option;
    this.remoteLabel.set(one?.label || '');
  }
}
