<template>
  <main class="page-auth-status">
    <div
      class="page-auth-status-atmosphere"
      aria-hidden="true"
    />

    <section
      class="page-auth-status-panel"
      :class="panelClass"
      :role="role"
      :aria-labelledby="titleId"
    >
      <header class="page-auth-status-brand">
        <span class="page-auth-status-mark">
          <BrandLogoMark class="page-auth-status-logo" />
        </span>
        <div class="page-auth-status-brand-text">
          <span class="page-auth-status-brand-name">kv3-admin</span>
          <span class="page-auth-status-brand-sub">投放工作台</span>
        </div>
      </header>

      <div
        class="page-auth-status-icon"
        :class="iconClass"
        aria-hidden="true"
      >
        <el-icon :size="32">
          <slot name="icon" />
        </el-icon>
      </div>

      <h1
        :id="titleId"
        class="page-auth-status-title"
      >
        <slot name="title" />
      </h1>
      <p
        v-if="$slots.desc"
        class="page-auth-status-desc"
      >
        <slot name="desc" />
      </p>

      <slot name="meta" />

      <div class="page-auth-status-actions">
        <slot name="actions" />
      </div>

      <p class="page-auth-status-hint">会话由统一认证托管，本系统不保存登录口令</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import BrandLogoMark from '@/components/BrandLogoMark.vue';

const props = withDefaults(
  defineProps<{
    titleId: string;
    iconTone?: 'warning' | 'success';
    role?: 'alert' | 'status';
  }>(),
  {
    iconTone: 'warning',
    role: 'status',
  },
);

const iconClass = computed(() =>
  props.iconTone === 'success' ? 'page-auth-status-icon-success' : 'page-auth-status-icon-warning',
);

const panelClass = computed(() =>
  props.iconTone === 'success'
    ? 'page-auth-status-panel-success'
    : 'page-auth-status-panel-warning',
);
</script>

<style lang="scss" scoped>
.page-auth-status {
  position: relative;
  box-sizing: border-box;
  display: grid;
  height: 100%;
  min-height: 100%;
  padding: 32px 24px;
  place-items: center;
  overflow: hidden;
  background: var(--bg-page-gradient, var(--bg-page));
}

.page-auth-status-atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 80% 55% at 50% -8%,
      color-mix(in srgb, var(--el-color-primary) 22%, transparent),
      transparent 68%
    ),
    radial-gradient(
      ellipse 42% 36% at 12% 88%,
      color-mix(in srgb, var(--el-color-primary) 12%, transparent),
      transparent 62%
    ),
    radial-gradient(
      ellipse 46% 32% at 92% 78%,
      color-mix(in srgb, var(--el-color-primary-light-3) 16%, transparent),
      transparent 60%
    );
}

.page-auth-status-panel {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  box-sizing: border-box;
  width: min(460px, 100%);
  padding: 36px 32px 28px;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--el-color-primary) 12%, var(--bg-card)) 0%,
    var(--bg-card) 48%
  );
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--el-color-primary) 8%, transparent),
    0 20px 48px color-mix(in srgb, var(--el-color-primary) 14%, transparent);
  backdrop-filter: blur(12px);
  text-align: center;
  animation: page-auth-status-enter 280ms ease-out;
}

.page-auth-status-panel::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--el-color-primary),
    color-mix(in srgb, var(--el-color-primary-light-3) 80%, var(--el-color-primary)),
    transparent
  );
}

.page-auth-status-panel-success::before {
  background: linear-gradient(
    90deg,
    transparent,
    var(--el-color-success),
    color-mix(in srgb, var(--el-color-success-light-3) 80%, var(--el-color-success)),
    transparent
  );
}

.page-auth-status-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 90% 48% at 50% -8%,
    color-mix(in srgb, var(--el-color-primary) 16%, transparent),
    transparent 72%
  );
}

.page-auth-status-panel-success::after {
  background: radial-gradient(
    ellipse 90% 48% at 50% -8%,
    color-mix(in srgb, var(--el-color-success) 14%, transparent),
    transparent 72%
  );
}

.page-auth-status-panel > * {
  position: relative;
  z-index: 1;
}

.page-auth-status-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
}

.page-auth-status-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 14%, var(--bg-card));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 16%, transparent);
}

.page-auth-status-logo {
  width: 22px;
  height: 22px;
}

.page-auth-status-brand-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.page-auth-status-brand-name {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.page-auth-status-brand-sub {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.2;
}

.page-auth-status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 50%;
}

.page-auth-status-icon-warning {
  background: color-mix(in srgb, var(--el-color-warning) 14%, var(--bg-card));
  color: var(--el-color-warning);
  box-shadow: 0 0 0 8px color-mix(in srgb, var(--el-color-warning) 8%, transparent);
}

.page-auth-status-icon-success {
  background: color-mix(in srgb, var(--el-color-success) 14%, var(--bg-card));
  color: var(--el-color-success);
  box-shadow: 0 0 0 8px color-mix(in srgb, var(--el-color-success) 8%, transparent);
}

.page-auth-status-title {
  margin: 0 0 8px;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.page-auth-status-desc {
  margin: 0 auto 20px;
  max-width: 34em;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.page-auth-status-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-auth-status-actions :deep(.el-button) {
  min-width: 108px;
  margin: 0;
}

.page-auth-status-hint {
  margin: 24px 0 0;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  line-height: 1.5;
}

@keyframes page-auth-status-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-auth-status-panel {
    animation: none;
  }
}

@media (max-width: 480px) {
  .page-auth-status {
    padding: 20px 16px;
  }

  .page-auth-status-panel {
    padding: 28px 20px 22px;
    border-radius: 14px;
  }

  .page-auth-status-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  .page-auth-status-icon-warning {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--el-color-warning) 8%, transparent);
  }

  .page-auth-status-icon-success {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--el-color-success) 8%, transparent);
  }

  .page-auth-status-title {
    font-size: 20px;
  }
}
</style>
