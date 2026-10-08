import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'ka-header-example-tab',
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
export class HeaderExampleTab {}
