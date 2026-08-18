<template>
  <AccountAccessTip
    title="暂无权限"
    description="当前账号缺少访问权限，请联系管理员开通。"
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
