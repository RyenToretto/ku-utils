<template>
  <div class="page-coming-soon">
    <el-empty :description="emptyDescription">
      <template #image>
        <div class="page-coming-soon-badge">Coming Soon</div>
      </template>
      <div class="page-coming-soon-meta">
        <p v-if="permission">
          权限 Key：
          <code>{{ permission }}</code>
        </p>
        <p v-if="owner">
          负责人：
          <strong>{{ owner }}</strong>
        </p>
        <p
          v-if="!backendReady"
          class="page-coming-soon-warn"
        >
          后端尚未落地该模块 Controller；请勿臆造运行时请求，缺口见 waitRD。
        </p>
        <p v-if="docsHint">
          接口合同：
          <code>{{ docsHint }}</code>
        </p>
      </div>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const title = computed(() => String(route.meta.title || '功能'));
const permission = computed(() => String(route.meta.permission || ''));
const owner = computed(() => String(route.meta.owner || '待认领'));
const backendReady = computed(() => route.meta.backendReady !== false);
const docsHint = computed(() => String(route.meta.docsPath || ''));

const emptyDescription = computed(() => `${title.value} · 页面建设中，欢迎认领开发`);
</script>

<style lang="scss" scoped>
.page-coming-soon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100% - 24px);
  margin: 12px 0 24px;
  padding: 32px 24px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-light);
  border-radius: 8px;
}

.page-coming-soon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 40px;
  margin: 0 auto 8px;
  border-radius: 999px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.page-coming-soon-meta {
  margin-top: 8px;
  color: var(--text-secondary, #666);
  font-size: 13px;
  line-height: 1.7;
  text-align: center;

  code {
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--el-fill-color-light);
    font-size: 12px;
  }
}

.page-coming-soon-warn {
  color: var(--el-color-warning);
}
</style>
