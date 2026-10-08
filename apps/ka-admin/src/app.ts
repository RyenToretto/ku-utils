import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { injectVersionUpdate } from '@ku-utils/hooks-angular';
import NProgress from 'nprogress';
import { filter, map } from 'rxjs';

import { AppBootstrap } from '@/bootstrap/app-bootstrap';
import { isSplashGateOpen } from '@/bootstrap/splash-gate';
import { dismissSplashWhenReady } from '@/bootstrap/splash-readiness';
import { DialogPreviewVideo } from '@/components/dialog-preview-video';
import { BaseHeader } from '@/layouts/base-header';
import { clearLegacyVirtualUserWorkspace } from '@/plugins/http';
import { AppStore } from '@/stores/app';
import { isAuthStatusPath } from '@/utils/auth-status';
import { setupChunkErrorHandler } from '@/utils/chunk-error-handler';
import { fetchStaticVersion } from '@/utils/version';
import ErrorPage from '@/views/error-page';

NProgress.configure({ showSpinner: false });

@Component({
  selector: 'ka-root',
  imports: [BaseHeader, DialogPreviewVideo, ErrorPage, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    @switch (bootstrap.mode()) {
      @case ('tip') {
        <ka-error-page [code]="bootstrap.tipCode()" />
      }
      @case ('routed') {
        <div
          class="app-entry"
          style="display: flex; flex-direction: column; height: 100%; overflow: hidden; background: var(--ku-bg-page-gradient, var(--ku-bg-page))"
        >
          @if (!hideHeader()) {
            <ka-base-header
              [hasUpdate]="version.hasUpdate()"
              (refresh)="version.refreshForUpdate()"
            />
          }
          <div
            class="app-shell-main"
            style="flex: 1; min-height: 0; overflow: hidden"
          >
            <router-outlet />
          </div>
        </div>
        <ka-dialog-preview-video />
      }
    }
  `,
})
export class App {
  protected readonly bootstrap = inject(AppBootstrap);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly routerReady = signal(false);

  protected readonly version = injectVersionUpdate({
    fetchVersion: fetchStaticVersion,
    getVersionId: (v) => `${v.version}:${v.versionTimeISO}`,
    getVersionTime: (v) => `${v.version}:${v.versionTime}`,
  });

  protected readonly hideHeader = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => isAuthStatusPath(e.urlAfterRedirects)),
    ),
    { initialValue: isAuthStatusPath(window.location.pathname) },
  );

  constructor() {
    inject(AppStore).applyTheme();
    clearLegacyVirtualUserWorkspace();
    inject(DestroyRef).onDestroy(setupChunkErrorHandler(this.router));

    const sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!isSplashGateOpen()) NProgress.start();
        return;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        if (!isSplashGateOpen()) NProgress.done();
        if (event instanceof NavigationEnd) window.scrollTo(0, 0);
        this.markRouterReady();
      }
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());

    if (this.bootstrap.mode() === 'tip') this.markRouterReady();
  }

  /** 首屏路由渲染完成后淡出内联 Splash（对齐 kr `useSplashReadiness`） */
  private markRouterReady() {
    if (this.routerReady()) return;
    this.routerReady.set(true);
    afterNextRender(() => void dismissSplashWhenReady(), { injector: this.injector });
  }
}
