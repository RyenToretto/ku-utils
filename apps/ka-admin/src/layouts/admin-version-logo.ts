import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { BrandLogoMark } from '@/components/brand-logo-mark';
import { doEnv } from '@/utils/env';

@Component({
  selector: 'ka-admin-version-logo',
  imports: [BrandLogoMark, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ng-template #inner>
      <span class="logo-icon-wrap">
        <ka-brand-logo-mark svgClass="logo-mark" />
        <span class="logo-text">{{ label }}</span>
        @if (hasUpdate()) {
          <span
            class="logo-update-badge"
            role="status"
          >
            <span
              class="logo-update-dot"
              aria-hidden="true"
            ></span>
            新版本
          </span>
        }
      </span>
    </ng-template>

    @if (hasUpdate()) {
      <button
        type="button"
        class="admin-version-logo has-update"
        title="发现新版本，点击刷新页面"
        aria-label="发现新版本，点击刷新页面"
        (click)="refresh.emit()"
      >
        <ng-container [ngTemplateOutlet]="inner" />
      </button>
    } @else {
      <div
        class="admin-version-logo"
        [title]="projectName"
      >
        <ng-container [ngTemplateOutlet]="inner" />
      </div>
    }
  `,
})
export class AdminVersionLogo {
  readonly hasUpdate = input(false);
  readonly refresh = output<void>();

  protected readonly projectName = doEnv.projectName;
  protected readonly label = this.projectName.replace(/-/g, ' ');
}
