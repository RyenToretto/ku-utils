<template>
  <AccountAccessTip
    title="账号未开通"
    description="当前登录身份尚未在本系统开通账号，请联系管理员处理。"
    :code="code"
  />
</template>

<script setup lang="ts">
import AccountAccessTip from '@/views/AccountAccessTip.vue';

defineProps<{
  code?: string | number | null;
}>();
</script>
