<template>
  <AccountAccessTip
    title="页面异常"
    description="资源加载失败或发生未知错误。可尝试重新登录，或联系管理员排查。"
    :code="code"
  />
</template>

<script setup lang="ts">
import AccountAccessTip from '@/views/AccountAccessTip.vue';

/** Vue2.7：prop 类型勿写 `| null`（会编成 type:null 报 Invalid prop type） */
withDefaults(
  defineProps<{
    code?: string | number;
  }>(),
  {
    code: undefined,
  },
);
</script>
