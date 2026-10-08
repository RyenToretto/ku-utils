import { bootstrapApplication } from '@angular/platform-browser';

import { App } from '@/app';
import { appConfig } from '@/app.config';
import { applyInitialTheme } from '@/utils/theme';

applyInitialTheme('admin');

bootstrapApplication(App, appConfig).catch((err: unknown) => console.error(err));
