<template>
  <section
    id="ui"
    class="pg-section"
  >
    <h3>@ku-utils/skin + @ku-utils/ui</h3>
    <p class="pg-hint">
      入口已
      <code class="pg-code">import '@ku-utils/skin'</code>
      ，主色应为 Lark 蓝
      <code class="pg-code">#3370ff</code>
      。液态玻璃见左侧固定栏。
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
      style="margin-top: var(--ku-space-4); max-width: 28rem"
    >
      <DuEmpty description="DuEmpty：暂无内容" />
    </DuCard>

    <DuModal
      v-model="modalOpen"
      title="DuModal"
    >
      皮肤变量驱动的弹层。点遮罩或关闭即可。
    </DuModal>
  </section>
</template>

<script setup lang="ts">
import { DuButton, DuCard, DuEmpty, DuModal, DuStatusTag } from '@ku-utils/ui';
import { ref } from 'vue';

defineOptions({ name: 'UiDemo' });

const modalOpen = ref(false);
</script>
