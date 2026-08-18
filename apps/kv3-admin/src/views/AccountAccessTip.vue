<template>
  <div class="page-account-access-tip">
    <div class="page-account-access-tip-card">
      <h1 class="page-account-access-tip-title">{{ title }}</h1>
      <p class="page-account-access-tip-desc">{{ description }}</p>
      <p
        v-if="codeText"
        class="page-account-access-tip-code"
      >
        异常码 {{ codeText }}
      </p>
      <el-button
        type="primary"
        class="page-account-access-tip-action"
        :loading="logoutLoading"
        @click="handleRelogin"
      >
        重新登录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { submitLogout } from '@/utils/authRedirect';

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    /** 服务端业务码或其它可展示标识；空则不展示 */
    code?: string | number | null;
  }>(),
  {
    title: '账号异常',
    description: '当前账号异常或无访问权限，请联系管理员处理。',
    code: null,
  },
);

const logoutLoading = ref(false);

const codeText = computed(() => {
  if (props.code == null || props.code === '') return '';
  return String(props.code);
});

function handleRelogin() {
  logoutLoading.value = true;
  submitLogout('login');
}
</script>

<style lang="scss" scoped>
.page-account-access-tip {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  box-sizing: border-box;
  background: var(--ku-bg-page, var(--el-bg-color-page));
}

.page-account-access-tip-card {
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.page-account-access-tip-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--ku-text-primary, var(--el-text-color-primary));
}

.page-account-access-tip-desc {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.page-account-access-tip-code {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

.page-account-access-tip-action {
  margin-top: 28px;
  min-width: 120px;
}
</style>
