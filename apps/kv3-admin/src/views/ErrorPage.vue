<template>
  <AccountAccessTip
    title="页面异常"
    description="资源加载失败或发生未知错误。可尝试重新登录，或联系管理员排查。"
    :code="code"
  />
</template>

<script setup lang="ts">
import AccountAccessTip from '@/views/AccountAccessTip.vue';

withDefaults(
  defineProps<{
    code?: string | number | null;
  }>(),
  {
    code: null,
  },
);
</script>
