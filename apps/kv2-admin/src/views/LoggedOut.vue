<template>
  <AuthStatusShell
    title-id="logged-out-title"
    icon-tone="success"
    role="status"
  >
    <template #icon>
      <CircleCheck />
    </template>
    <template #title>已退出登录</template>
    <template #desc>会话已安全退出。重新登录后将回到工作台。</template>
    <template #actions>
      <el-button
        type="primary"
        @click="handleRelogin"
      >
        重新登录
      </el-button>
    </template>
  </AuthStatusShell>
</template>

<script setup lang="ts">
import AuthStatusShell from './AuthStatusShell.vue';

import { CircleCheck } from '@/components/icons/elIcons';
import { buildLoginUrl } from '@/utils/authRedirect';

function handleRelogin() {
  window.location.href = buildLoginUrl('/');
}
</script>
