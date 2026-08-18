<template>
  <div class="do-form-section">
    <div class="do-form-left">
      <slot name="left" />
    </div>
    <div class="do-form-split">
      <div class="do-form-split-line">
        <span
          v-if="splitLabel"
          class="do-form-split-label"
        >
          {{ splitLabel }}
        </span>
      </div>
    </div>
    <div class="do-form-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 双栏表单布局（样式见 `_page-utils.scss` `.do-form-section`）。
 * 左栏 / 右栏通过具名插槽传入。
 */
withDefaults(
  defineProps<{
    /** 中间分割线上的可选文案 */
    splitLabel?: string;
  }>(),
  {
    splitLabel: '',
  },
);
</script>
