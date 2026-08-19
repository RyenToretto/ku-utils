<template>
  <section
    id="hooks"
    class="pg-section"
  >
    <h3>@ku-utils/hooks</h3>
    <p class="pg-hint">倒计时、剪贴板、loading 包裹、本地存储。</p>

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
        @click="copy('ku-utils playground')"
      >
        {{ copied ? '已复制' : 'useClipboard 复制' }}
      </DuButton>
    </div>

    <div class="pg-row">
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

    <div class="pg-row">
      <label>
        useStorage
        <input
          v-model="note"
          class="pg-input"
          placeholder="刷新后仍在"
        />
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useClipboard, useCountdown, useLoading, useStorage } from '@ku-utils/hooks';
import { DuButton } from '@ku-utils/ui';
import { ref } from 'vue';

defineOptions({ name: 'HooksDemo' });

const { count, isActive, start, stop, reset } = useCountdown(8);
const { copied, copy } = useClipboard();
const { loading, wrap } = useLoading();
const loadMsg = ref('');
const note = useStorage('pg-vue3-note', '');

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
