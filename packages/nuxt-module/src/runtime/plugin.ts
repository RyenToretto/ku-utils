import { installDirectives } from '@ku-utils/directives';
import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin((nuxtApp) => {
  installDirectives(nuxtApp.vueApp);
});
