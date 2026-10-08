import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import zh from '@angular/common/locales/zh';
import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { zhCN } from 'date-fns/locale';
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';
import { provideNzI18n, zh_CN } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';

import { AppBootstrap } from '@/bootstrap/app-bootstrap';
import { apiEnvelopeInterceptor } from '@/plugins/http';
import { ZORRO_ICONS } from '@/plugins/zorro-icons';
import { routes } from '@/router/routes';

registerLocaleData(zh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([apiEnvelopeInterceptor])),
    provideNzI18n(zh_CN),
    provideNzDateFnsAdapter({ locale: zhCN, firstDayOfWeek: 1 }),
    provideNzIcons(ZORRO_ICONS),
    provideNzConfig({
      message: { nzTop: 8, nzMaxStack: 5 },
      form: { nzNoColon: true },
    }),
    provideAppInitializer(() => inject(AppBootstrap).run()),
  ],
};
