<template>
  <div>
    <h1>ku-utils Playground - Nuxt 4</h1>
    <p>验证 @ku-utils/nuxt-module 自动注入 skin / ui / hooks / directives</p>

    <nav class="pg-nav">
      <a href="#ui">ui / skin</a>
      <a href="#hooks">hooks</a>
      <a href="#utils">utils / constants / types</a>
      <a href="#directives">directives</a>
      <a href="#i18n">i18n</a>
      <a href="#toolchain">工程配置</a>
    </nav>

    <section
      id="ui"
      class="pg-section"
    >
      <h3>@ku-utils/ui（模块自动注册）</h3>
      <p class="pg-hint">
        主色应为 tome 金
        <code class="pg-code">#9a6328</code>
        。Du* 无需手动 import。液态玻璃见左侧固定栏。
      </p>
      <div class="pg-row">
        <DuButton type="primary">Primary</DuButton>
        <DuButton type="success">Success</DuButton>
        <DuButton type="warning">Warning</DuButton>
        <DuButton type="danger">Danger</DuButton>
        <DuButton>Default</DuButton>
      </div>
      <div class="pg-row">
        <DuStatusTag status="success">成功</DuStatusTag>
        <DuStatusTag status="warning">警告</DuStatusTag>
        <DuStatusTag status="danger">危险</DuStatusTag>
        <DuStatusTag status="info">信息</DuStatusTag>
      </div>
      <div class="pg-row">
        <DuButton
          type="primary"
          @click="modalOpen = true"
        >
          打开 DuModal
        </DuButton>
      </div>
      <DuCard
        title="DuCard"
        subtitle="带边框卡片"
        style="margin-top: 1rem; max-width: 28rem"
      >
        <DuEmpty description="DuEmpty：暂无内容" />
      </DuCard>
      <DuModal
        v-model="modalOpen"
        title="DuModal"
      >
        由 nuxt-module 自动注册的弹层。
      </DuModal>
    </section>

    <section
      id="hooks"
      class="pg-section"
    >
      <h3>@ku-utils/hooks（模块 auto-import）</h3>
      <p class="pg-hint">
        useDeviceDetect 走 nuxt-module 的 SSR wrapper。isMobile=
        <code class="pg-code">{{ isMobile }}</code>
      </p>
      <div class="pg-row">
        <span>countdown: {{ count }} {{ isActive ? '(进行中)' : '(停止)' }}</span>
        <DuButton
          type="primary"
          size="small"
          :disabled="isActive"
          @click="start(8)"
        >
          开始 8s
        </DuButton>
        <DuButton
          size="small"
          @click="stop"
        >
          停止
        </DuButton>
        <DuButton
          size="small"
          @click="reset"
        >
          重置
        </DuButton>
      </div>
      <div class="pg-row">
        <DuButton
          type="primary"
          size="small"
          @click="copy('ku-utils nuxt playground')"
        >
          {{ copied ? '已复制' : 'useClipboard 复制' }}
        </DuButton>
        <DuButton
          type="primary"
          size="small"
          :loading="loading"
          @click="runFakeRequest"
        >
          useLoading.wrap
        </DuButton>
        <span class="pg-muted">{{ loadMsg }}</span>
      </div>
    </section>

    <section
      id="utils"
      class="pg-section"
    >
      <h3>@ku-utils/utils + constants + types</h3>
      <ul class="pg-list">
        <li>
          formatDate:
          <code class="pg-code">{{ dated }}</code>
        </li>
        <li>
          emptyReplace(null):
          <code class="pg-code">{{ empty }}</code>
        </li>
        <li>
          camelCase('hello_world'):
          <code class="pg-code">{{ camel }}</code>
        </li>
        <li>
          types.UserInfo.username:
          <code class="pg-code">{{ demoUser.username }}</code>
        </li>
      </ul>
      <div class="pg-row">
        <input
          v-model="email"
          class="pg-input"
          placeholder="校验 REGEX.EMAIL"
        />
        <span :class="emailOk ? 'pg-ok' : 'pg-bad'">
          {{ emailOk ? '邮箱合法' : '邮箱不合法' }}
        </span>
      </div>
    </section>

    <section
      id="directives"
      class="pg-section"
    >
      <h3>@ku-utils/directives（client plugin）</h3>
      <p class="pg-hint">指令在客户端插件中注册，以下示例包在 ClientOnly 内。</p>
      <ClientOnly>
        <div class="pg-row">
          <DuButton
            v-copy="'copied from v-copy'"
            type="primary"
            size="small"
          >
            v-copy
          </DuButton>
          <DuButton
            v-tooltip="'这是 v-tooltip'"
            size="small"
          >
            悬停 v-tooltip
          </DuButton>
          <DuButton
            v-debounce="debounceBind"
            size="small"
          >
            v-debounce {{ debounceCount }}
          </DuButton>
          <DuButton
            v-permission="'pg:ok'"
            type="success"
            size="small"
          >
            v-permission pg:ok
          </DuButton>
        </div>
        <div
          v-watermark="['ku-utils', 'nuxt4']"
          class="pg-watermark"
        >
          v-watermark
        </div>
      </ClientOnly>
    </section>

    <section
      id="i18n"
      class="pg-section"
    >
      <h3>@ku-utils/i18n</h3>
      <p class="pg-hint">
        plugins/playground.ts 里
        <code class="pg-code">createI18n + setGlobalI18n</code>
        。浏览器语言：
        <code class="pg-code">{{ browserLocale }}</code>
      </p>
      <div class="pg-row">
        <strong>{{ t('demo.hello', { name: 'ku-utils' }) }}</strong>
        <DuButton
          size="small"
          type="primary"
          @click="toggleLocale"
        >
          {{ t('demo.switch') }}
        </DuButton>
        <span class="pg-muted">locale={{ locale }}</span>
      </div>
    </section>

    <section
      id="toolchain"
      class="pg-section"
    >
      <h3>工程配置 + nuxt-module</h3>
      <ul class="pg-list">
        <li>
          <code class="pg-code">@ku-utils/nuxt-module</code>
          →
          <code class="pg-code">nuxt.config.ts modules</code>
        </li>
        <li>
          <code class="pg-code">@ku-utils/eslint-config/nuxt4</code>
        </li>
        <li>
          <code class="pg-code">@ku-utils/prettier-config</code>
          /
          <code class="pg-code">@ku-utils/tsconfig</code>
        </li>
        <li>custom-columns 示例见 playground-vue3（需 Element Plus）</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { REGEX } from '@ku-utils/constants';
import { detectBrowserLocale, useI18n } from '@ku-utils/i18n';
import type { UserInfo } from '@ku-utils/types';
import { camelCase, emptyReplace, formatDate } from '@ku-utils/utils';

const modalOpen = ref(false);
const { count, isActive, start, stop, reset } = useCountdown(8);
const { copied, copy } = useClipboard();
const { loading, wrap } = useLoading();
const { isMobile } = useDeviceDetect();
const loadMsg = ref('');
const debounceCount = ref(0);
const email = ref('dev@example.com');
const emailOk = computed(() => REGEX.EMAIL.test(email.value));

const dated = formatDate(Date.now());
const empty = emptyReplace(null);
const camel = camelCase('hello_world');

const demoUser: UserInfo = {
  id: '1',
  username: 'playground',
  nickname: '演示用户',
  avatar: '',
  email: 'dev@example.com',
  phone: '',
  roles: ['demo'],
  permissions: ['pg:ok'],
};

const debounceBind = {
  handler: () => {
    debounceCount.value += 1;
  },
  delay: 300,
  event: 'click',
};

const { t, locale, setLocale } = useI18n();
const browserLocale = detectBrowserLocale();

function toggleLocale() {
  setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN');
}

async function runFakeRequest() {
  loadMsg.value = '';
  await wrap(
    () =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, 800);
      }),
  );
  loadMsg.value = '完成';
}
</script>
