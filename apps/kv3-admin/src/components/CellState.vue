<template>
  <div class="cell-state">
    <!-- Switch mode -->
    <template v-if="switchable">
      <el-popconfirm
        v-if="!manual"
        :title="isActive ? resolvedConfirmDisable : resolvedConfirmEnable"
        @confirm="emitSwitch"
      >
        <template #reference>
          <el-switch
            :model-value="isActive"
            :disabled="switching"
          />
        </template>
      </el-popconfirm>
      <el-switch
        v-else
        :model-value="isActive"
        :disabled="switching"
        @change="emitSwitch"
      />
      <el-icon
        v-if="switching"
        class="cell-state-loading"
      >
        <Loading />
      </el-icon>
    </template>
    <!-- Tag mode: 圆点 + 文字指示器，不带背景、不像按钮 -->
    <span
      v-else
      class="cell-state-indicator"
      :class="`is-${isActive ? activeType : inactiveType}`"
    >
      {{ isActive ? resolvedActiveLabel : resolvedInactiveLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { computed } from 'vue';

type TagType = 'success' | 'warning' | 'danger' | 'info' | 'primary';

interface Props {
  modelValue: string | number | boolean | null | undefined;
  activeValue?: string | number | boolean;
  inactiveValue?: string | number | boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  activeType?: TagType;
  inactiveType?: TagType;
  size?: 'large' | 'default' | 'small';
  switchable?: boolean;
  switching?: boolean;
  activeTips?: string;
  inactiveTips?: string;
  manual?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  activeValue: 1,
  inactiveValue: 0,
  activeLabel: undefined,
  inactiveLabel: undefined,
  activeType: 'success',
  inactiveType: 'info',
  size: 'default',
  switchable: false,
  switching: false,
  activeTips: undefined,
  inactiveTips: undefined,
  manual: false,
});

const emit = defineEmits<{
  (e: 'switch', value: string | number | boolean): void;
}>();

const resolvedActiveLabel = computed(() => props.activeLabel ?? '启用');
const resolvedInactiveLabel = computed(() => props.inactiveLabel ?? '禁用');
const resolvedConfirmEnable = computed(() => props.activeTips ?? '确认启用？');
const resolvedConfirmDisable = computed(() => props.inactiveTips ?? '确认禁用？');

const isActive = computed(() => props.modelValue === props.activeValue);
const targetValue = computed(() =>
  isActive.value ? (props.inactiveValue ?? 0) : (props.activeValue ?? 1),
);

function emitSwitch() {
  emit('switch', targetValue.value);
}
</script>

<style lang="scss" scoped>
.cell-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .cell-state-loading {
    font-size: 14px;
    color: var(--el-color-primary);
    animation: cell-state-spin 1s linear infinite;
  }
}

.cell-state-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;

  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
}

.cell-state-indicator.is-success {
  color: var(--el-color-success);

  &::before {
    background: var(--el-color-success);
  }
}

.cell-state-indicator.is-danger {
  color: var(--el-color-danger);

  &::before {
    background: var(--el-color-danger);
  }
}

.cell-state-indicator.is-warning {
  color: var(--el-color-warning);

  &::before {
    background: var(--el-color-warning);
  }
}

.cell-state-indicator.is-info {
  color: var(--el-text-color-secondary);

  &::before {
    background: var(--el-text-color-secondary);
  }
}

.cell-state-indicator.is-primary {
  color: var(--el-color-primary);

  &::before {
    background: var(--el-color-primary);
  }
}

@keyframes cell-state-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
