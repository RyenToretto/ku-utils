<template>
  <div
    class="do-sorter"
    :class="{ 'has-value': hasValue }"
  >
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom-end"
      trigger="click"
      :width="280"
      :show-arrow="false"
      teleported
      popper-class="do-sorter-popover"
    >
      <template #reference>
        <div class="do-sorter-trigger">
          <span
            v-if="hasValue && currentLabel"
            class="do-sorter-label"
          >
            {{ currentLabel }}
          </span>
          <span class="do-sorter-icon">
            <i
              class="do-sorter-arrow do-sorter-arrow-up"
              :class="{ active: hasValue && currentSequence === fieldAsc }"
            />
            <i
              class="do-sorter-arrow do-sorter-arrow-down"
              :class="{ active: hasValue && currentSequence === fieldDesc }"
            />
          </span>
        </div>
      </template>

      <div class="do-sorter-dropdown">
        <div class="do-sorter-option-list">
          <div
            v-for="option in sortOptions"
            :key="option.value"
            class="do-sorter-option-row"
          >
            <span class="do-sorter-option-label">{{ option.label }}</span>
            <span
              class="do-sorter-option-order"
              :class="{ active: tempOrderBy === option.value && tempSequence === fieldAsc }"
              @click="handleOrderSelect(option.value, fieldAsc)"
            >
              升序
            </span>
            <span
              class="do-sorter-option-order"
              :class="{ active: tempOrderBy === option.value && tempSequence === fieldDesc }"
              @click="handleOrderSelect(option.value, fieldDesc)"
            >
              降序
            </span>
          </div>
        </div>

        <div class="do-sorter-footer">
          <el-button
            size="small"
            @click="handleOrderSelect('', '')"
          >
            清空
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleConfirm"
          >
            确定
          </el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

export type DoSorterOption = {
  label: string;
  value: string;
};

export type DoSorterChangePayload = {
  orderBy: string;
  sequence: string;
};

defineOptions({ name: 'DoSorter' });

const props = withDefaults(
  defineProps<{
    orderBy?: string;
    sequence?: string;
    options?: DoSorterOption[];
    /** 升序取值，默认对齐列表合同 `asc` */
    fieldAsc?: string;
    /** 降序取值，默认对齐列表合同 `desc` */
    fieldDesc?: string;
  }>(),
  {
    orderBy: '',
    sequence: '',
    options: () => [],
    fieldAsc: 'asc',
    fieldDesc: 'desc',
  },
);

const emit = defineEmits<{
  'update:orderBy': [value: string];
  'update:sequence': [value: string];
  change: [payload: DoSorterChangePayload];
}>();

const popoverVisible = ref(false);
const currentOrderBy = ref(props.orderBy || '');
const currentSequence = ref(props.sequence || '');
const tempOrderBy = ref(props.orderBy || '');
const tempSequence = ref(props.sequence || '');

const sortOptions = computed(() => props.options || []);
const hasValue = computed(() => Boolean(currentOrderBy.value && currentSequence.value));
const currentLabel = computed(() => {
  if (!hasValue.value) return '';
  const option = sortOptions.value.find((opt) => opt.value === currentOrderBy.value);
  return option?.label || '';
});

watch(
  () => props.orderBy,
  (next) => {
    currentOrderBy.value = next || '';
    tempOrderBy.value = next || '';
  },
);

watch(
  () => props.sequence,
  (next) => {
    currentSequence.value = next || '';
    tempSequence.value = next || '';
  },
);

watch(popoverVisible, (visible) => {
  if (visible) {
    tempOrderBy.value = currentOrderBy.value;
    tempSequence.value = currentSequence.value;
  }
});

function handleOrderSelect(field: string, order: string) {
  tempOrderBy.value = field;
  tempSequence.value = order;
}

function handleConfirm() {
  const hasChange =
    tempOrderBy.value !== currentOrderBy.value || tempSequence.value !== currentSequence.value;

  if (hasChange) {
    currentOrderBy.value = tempOrderBy.value;
    currentSequence.value = tempSequence.value;
    emit('update:orderBy', currentOrderBy.value);
    emit('update:sequence', currentSequence.value);
    emit('change', {
      orderBy: currentOrderBy.value,
      sequence: currentSequence.value,
    });
  }

  popoverVisible.value = false;
}
</script>

<style lang="scss" scoped>
.do-sorter {
  display: inline-block;
  cursor: pointer;
  user-select: none;

  .do-sorter-trigger {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    border: 1px solid var(--border-light, var(--el-border-color));
    border-radius: 4px;
    background-color: var(--bg-card, var(--el-bg-color));
    transition: all 0.3s;
    font-size: 14px;
    color: var(--text-secondary, var(--el-text-color-regular));
    line-height: 1.2;

    &:hover {
      border-color: var(--primary-color, var(--el-color-primary));
      color: var(--primary-color, var(--el-color-primary));
    }
  }

  &.has-value {
    .do-sorter-trigger {
      border-color: var(--primary-color, var(--el-color-primary));
      color: var(--primary-color, var(--el-color-primary));
    }
  }

  .do-sorter-label {
    margin-right: 4px;
    font-size: 13px;
    line-height: 1.2;
  }

  .do-sorter-icon {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 14px;
    width: 10px;
    position: relative;
  }

  .do-sorter-arrow {
    width: 0;
    height: 0;
    border: 4px solid transparent;
    position: absolute;
    left: 1px;
  }

  .do-sorter-arrow-up {
    border-bottom-color: var(--text-placeholder, var(--el-text-color-placeholder));
    top: -2px;

    &.active {
      border-bottom-color: var(--primary-color, var(--el-color-primary));
    }
  }

  .do-sorter-arrow-down {
    border-top-color: var(--text-placeholder, var(--el-text-color-placeholder));
    bottom: -2px;

    &.active {
      border-top-color: var(--primary-color, var(--el-color-primary));
    }
  }
}
</style>

<style lang="scss">
.do-sorter-popover.el-popover.el-popper {
  padding: 0 !important;
  box-sizing: border-box;
}

.do-sorter-dropdown {
  padding: 8px 0 0;
  width: 100%;
  box-sizing: border-box;

  .do-sorter-option-list {
    max-height: 240px;
    overflow-y: auto;
  }

  .do-sorter-option-row {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 4px;
    margin: 4px 0;
    padding: 4px 16px;
    cursor: default;
    transition: background-color 0.3s;
    box-sizing: border-box;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  .do-sorter-option-label {
    flex: 1 1 auto;
    min-width: 5em;
    font-size: 14px;
    color: var(--text-secondary, var(--el-text-color-regular));
    margin-right: 8px;
    white-space: nowrap;
  }

  .do-sorter-option-order {
    flex: 0 0 auto;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 1.2;
    color: var(--text-placeholder, var(--el-text-color-secondary));
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;

    &:hover {
      background-color: var(--el-color-primary-light-9);
      color: var(--primary-color, var(--el-color-primary));
    }

    &.active {
      background-color: var(--primary-color, var(--el-color-primary));
      color: #fff;
    }
  }

  .do-sorter-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    box-sizing: border-box;
    background-color: var(--el-fill-color-lighter);
  }
}
</style>
