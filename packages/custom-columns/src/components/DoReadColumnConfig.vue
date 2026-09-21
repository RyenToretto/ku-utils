<template>
  <div class="do-read-column-config">
    <div
      v-for="(item, key) in configList"
      :key="key"
      class="read-from-local-line"
    >
      <el-button
        class="read-from-local-config"
        :class="{ active: item.label === currentConfigLabel }"
        plain
        size="small"
        @click="chooseColumnConfig(item)"
      >
        {{ item.label }}
      </el-button>
      <el-icon
        v-if="!disabledDelete && crud && !crud.existAlreadyWithSystem(item.label)"
        class="read-from-local-delete"
        @click="removeConfig(item.label)"
      >
        <Close />
      </el-icon>
    </div>

    <div
      v-if="!disabledCancelButton"
      class="read-from-local-line"
    >
      <el-button
        class="read-from-local-config active"
        plain
        size="small"
        @click="cancelChoose"
      >
        {{ messages.cancel }}
      </el-button>
    </div>
    <div
      v-if="showCustomConfigButton"
      class="read-from-local-line"
    >
      <el-button
        class="read-from-local-config custom"
        plain
        size="small"
        @click="clickCustom"
      >
        {{ messages.customConfig }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';
import { computed, inject, ref } from 'vue';

import {
  CRUD_INJECTION_KEY,
  DEFAULT_CUSTOM_COLUMN_MESSAGES,
} from '../composables/useSchemaColumnConfig';
import type { ColumnConfig, CrudContext } from '../types';

defineOptions({ name: 'DoReadColumnConfig' });

withDefaults(
  defineProps<{
    disabledDelete?: boolean;
    disabledCancelButton?: boolean;
    showCustomConfigButton?: boolean;
  }>(),
  {
    disabledDelete: false,
    disabledCancelButton: true,
    showCustomConfigButton: false,
  },
);

const emit = defineEmits<{
  confirm: [config: ColumnConfig];
  remove: [label: string];
  custom: [config: ColumnConfig | undefined];
  closed: [];
}>();

const crud = inject<CrudContext | null>(CRUD_INJECTION_KEY, null);
const messages = computed(() => crud?.messages || DEFAULT_CUSTOM_COLUMN_MESSAGES);

const currentConfigLabel = ref('');
const configList = ref<ColumnConfig[]>([]);

function getColumnConfigFromLocal(): void {
  if (!crud) return;
  const cache = crud.readCacheConfig();
  if (!cache) return;
  currentConfigLabel.value = cache.activeColumnConfigLabel || '';
  configList.value = cache.columnConfig || [];
}

function removeConfig(label: string): void {
  const idx = configList.value.findIndex((item) => item.label === label);
  if (idx < 0) return;
  configList.value.splice(idx, 1);
  emit('remove', label);
  emit('closed');
}

function chooseColumnConfig(config: ColumnConfig): void {
  currentConfigLabel.value = config.label;
  emit('confirm', config);
  emit('closed');
}

function cancelChoose(): void {
  emit('closed');
}

function clickCustom(): void {
  emit(
    'custom',
    configList.value.find((config) => config.label === currentConfigLabel.value),
  );
}

defineExpose({ getColumnConfigFromLocal });
</script>

<style scoped>
.do-read-column-config {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.read-from-local-line {
  margin: 10px 0 0;
  box-sizing: border-box;
  width: 100%;
  position: relative;
}

.read-from-local-delete {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  display: none;
}

.read-from-local-delete:hover {
  color: var(--ku-color-danger, #9f6559);
}

.read-from-local-line:hover .read-from-local-delete {
  display: block;
}

.read-from-local-config {
  box-sizing: border-box;
  width: 100%;
  opacity: 0.5;
}

.read-from-local-config.active,
.read-from-local-config:hover {
  background-color: var(--ku-bg-card, #f7f3eb);
  border-color: var(--ku-color-primary, #9a6328);
  color: var(--ku-color-primary, #9a6328);
}

.read-from-local-config.active {
  opacity: 1;
}
</style>
