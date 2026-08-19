export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: {
    compatibilityVersion: 4,
  },
  modules: ['@ku-utils/nuxt-module'],
  css: ['~/assets/playground.css'],
  devtools: { enabled: true },
});
