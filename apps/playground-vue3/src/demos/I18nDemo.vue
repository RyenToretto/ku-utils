<template>
  <section
    id="i18n"
    class="pg-section"
  >
    <h3>@ku-utils/i18n</h3>
    <p class="pg-hint">
      入口
      <code class="pg-code">createI18n + setGlobalI18n</code>
      ，页面
      <code class="pg-code">useI18n()</code>
      。浏览器语言：
      <code class="pg-code">{{ browserLocale }}</code>
    </p>
    <div class="pg-row">
      <strong>{{ t('demo.hello', { name: 'ku-utils' }) }}</strong>
      <DuButton
        size="small"
        type="primary"
        @click="toggle"
      >
        {{ t('demo.switch') }}
      </DuButton>
      <span class="pg-muted">locale={{ locale }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { detectBrowserLocale, useI18n } from '@ku-utils/i18n';
import { DuButton } from '@ku-utils/ui';

defineOptions({ name: 'I18nDemo' });

const { t, locale, setLocale } = useI18n();
const browserLocale = detectBrowserLocale();

function toggle() {
  setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN');
}
</script>
