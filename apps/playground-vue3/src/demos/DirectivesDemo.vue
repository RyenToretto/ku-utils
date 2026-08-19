<template>
  <section
    id="directives"
    class="pg-section"
  >
    <h3>@ku-utils/directives</h3>
    <p class="pg-hint">
      入口
      <code class="pg-code">installDirectives(app)</code>
      。v-loading 需单独注册，本页不演示（避免与 Element Plus 冲突）。
    </p>

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
        v-debounce 点击（300ms）{{ debounceCount }}
      </DuButton>
      <DuButton
        v-longpress="onLongpress"
        size="small"
      >
        长按 v-longpress {{ longpressCount }}
      </DuButton>
    </div>

    <div class="pg-row">
      <DuButton
        v-permission="'pg:ok'"
        type="success"
        size="small"
      >
        v-permission pg:ok（应显示）
      </DuButton>
      <span class="pg-muted">无权限按钮已被移除：v-permission="'pg:hidden'"</span>
      <DuButton
        v-permission="'pg:hidden'"
        size="small"
      >
        不应出现
      </DuButton>
    </div>

    <div class="pg-row">
      <div
        v-click-outside="onOutside"
        class="pg-panel"
      >
        点此框外：v-click-outside {{ outsideCount }}
      </div>
    </div>

    <div class="pg-row">
      <DuButton
        size="small"
        @click="showFocus = !showFocus"
      >
        {{ showFocus ? '收起' : '显示' }} v-focus 输入框
      </DuButton>
      <input
        v-if="showFocus"
        v-focus
        class="pg-input"
        placeholder="应自动聚焦"
      />
    </div>

    <div
      v-watermark="['ku-utils', 'playground']"
      class="pg-watermark"
    >
      v-watermark 覆盖层（不影响点击）
    </div>

    <div class="pg-row">
      <img
        v-lazy-load="lazySrc"
        alt="lazy"
        class="pg-lazy"
        width="160"
        height="64"
      />
      <span class="pg-muted">v-lazy-load 进入视口后赋值 src</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DuButton } from '@ku-utils/ui';
import { ref } from 'vue';

defineOptions({ name: 'DirectivesDemo' });

const debounceCount = ref(0);
const longpressCount = ref(0);
const outsideCount = ref(0);
const showFocus = ref(false);

const debounceBind = {
  handler: () => {
    debounceCount.value += 1;
  },
  delay: 300,
  event: 'click',
};

function onLongpress() {
  longpressCount.value += 1;
}

function onOutside() {
  outsideCount.value += 1;
}

const lazySrc = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="64"><rect fill="#3370ff" width="160" height="64"/><text x="80" y="38" text-anchor="middle" fill="#fff" font-size="14">lazy</text></svg>',
)}`;
</script>

<style>
.pg-watermark {
  position: relative;
  min-height: 96px;
  margin-top: var(--ku-space-3);
  padding: var(--ku-space-4);
  overflow: hidden;
  border: 1px dashed var(--ku-border-default);
  border-radius: var(--ku-radius-sm);
}

.pg-lazy {
  display: block;
  background: var(--ku-neutral-100);
  border-radius: var(--ku-radius-sm);
}
</style>
