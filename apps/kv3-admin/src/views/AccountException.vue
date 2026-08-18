<template>
  <AuthStatusShell
    title-id="account-exception-title"
    icon-tone="warning"
    role="alert"
  >
    <template #icon>
      <Lock />
    </template>
    <template #title>账号异常或无权限</template>
    <template #desc>
      登录已成功，但当前账号异常、尚未开通或缺少投放权限。可重试刷新状态，或切换其他账号。
    </template>
    <template
      v-if="codeLabel || detailLabel"
      #meta
    >
      <p class="page-account-exception-meta">
        <span
          v-if="codeLabel"
          class="page-account-exception-chip"
        >
          异常码 {{ codeLabel }}
        </span>
        <span
          v-if="detailLabel"
          class="page-account-exception-chip-detail"
        >
          {{ detailLabel }}
        </span>
      </p>
    </template>
    <template #actions>
      <el-button
        type="primary"
        :loading="retryLoading"
        :disabled="switchLoading"
        @click="handleRetry"
      >
        重试
      </el-button>
      <el-button
        :loading="switchLoading"
        :disabled="retryLoading"
        @click="handleSwitchAccount"
      >
        切换账号
      </el-button>
    </template>
  </AuthStatusShell>
</template>

<script setup lang="ts">
import { Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus/es';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import AuthStatusShell from './AuthStatusShell.vue';

import { MODULE_PERMISSION_KEYS } from '@/maps/common/dspPermission';
import { useUserStore } from '@/stores/user';
import {
  isUserInfoMissingLocalUserCode,
  redirectToLogin,
  submitLogout,
} from '@/utils/authRedirect';

const userStore = useUserStore();
const router = useRouter();
const retryLoading = ref(false);
const switchLoading = ref(false);

const codeLabel = computed(() => {
  const code = userStore.accessDenied?.code;
  if (code === undefined || code === null || code === '') return '';
  return String(code);
});

const detailLabel = computed(() => {
  const detail = userStore.accessDenied?.detail?.trim();
  if (!detail) return '';
  return detail.length > 80 ? `${detail.slice(0, 80)}…` : detail;
});

function isUnauthorizedRetryError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const anyErr = error as {
    message?: string;
    response?: { status?: number };
    code?: number | string;
  };
  if (anyErr.message === 'unauthorized') return true;
  if (anyErr.response?.status === 401 && !isUserInfoMissingLocalUserCode(anyErr.code)) return true;
  return false;
}

function isUserNotProvisionedRetryError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const anyErr = error as { message?: string; code?: number | string };
  if (anyErr.message === 'user-not-provisioned') return true;
  return isUserInfoMissingLocalUserCode(anyErr.code);
}

async function handleRetry() {
  if (retryLoading.value || switchLoading.value) return;
  retryLoading.value = true;
  try {
    await userStore.fetchUserInfo();
    if (!MODULE_PERMISSION_KEYS.some((key) => userStore.hasPermission(key))) {
      userStore.markNoPermissionDenied();
      return;
    }
    await router.replace('/');
  } catch (error: unknown) {
    if (isUnauthorizedRetryError(error)) {
      redirectToLogin();
      return;
    }
    if (isUserNotProvisionedRetryError(error)) {
      userStore.markAccessDeniedFromError(error);
      return;
    }
    ElMessage.error({
      message: '暂时无法刷新账号状态，请稍后重试',
      grouping: true,
      showClose: true,
    });
  } finally {
    retryLoading.value = false;
  }
}

function handleSwitchAccount() {
  if (retryLoading.value || switchLoading.value) return;
  switchLoading.value = true;
  userStore.clearSession();
  submitLogout('login');
}
</script>

<style lang="scss" scoped>
.page-account-exception-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 0 24px;
}

.page-account-exception-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.page-account-exception-chip-detail {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  line-height: 1.4;
}
</style>
