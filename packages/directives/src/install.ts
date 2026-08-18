import type { App } from 'vue';

import { vClickOutside } from './vClickOutside';
import { vCopy } from './vCopy';
import { vDebounce } from './vDebounce';
import { vFocus } from './vFocus';
import { vLazyLoad } from './vLazyLoad';
import { vLongpress } from './vLongpress';
import { vPermission } from './vPermission';
import { vWatermark } from './vWatermark';

/**
 * 统一注册 @ku-utils/directives 的自定义指令。
 *
 * 注意：v-loading（vLoading）不在此处注册，原因如下：
 *   - 在使用 Element Plus 的项目中，通常手动注册 ElLoading.directive，
 *     若此处再注册 vLoading 会触发 Vue 的"指令已注册"警告并覆盖 EP 的实现。
 *   - 需要使用 vLoading 的项目可从 '@ku-utils/directives' 单独 import 后手动注册：
 *     import { vLoading } from '@ku-utils/directives'
 *     app.directive('loading', vLoading)
 */
export function installDirectives(app: App) {
  app.directive('permission', vPermission);
  app.directive('click-outside', vClickOutside);
  app.directive('copy', vCopy);
  app.directive('debounce', vDebounce);
  app.directive('focus', vFocus);
  app.directive('lazy-load', vLazyLoad);
  app.directive('longpress', vLongpress);
  app.directive('watermark', vWatermark);
}
