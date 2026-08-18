<template>
  <div class="do-table-header">
    <DoConfigColumnDialog
      ref="configDialogRef"
      @confirm="toApplyColumnConfig"
    />

    <div class="table-batch">
      <slot name="batch" />
    </div>

    <div class="table-control">
      <slot name="control" />

      <el-popover
        v-if="!disabledColumnConfig"
        v-model:visible="visiblePopover"
        placement="bottom"
        popper-class="do-table-config-popper"
        trigger="hover"
        :width="240"
        @show="onPopoverShow"
      >
        <template #default>
          <DoReadColumnConfig
            ref="readConfigRef"
            disabled-delete
            show-custom-config-button
            @custom="toCustomColumn"
            @remove="toRemoveConfig"
            @closed="visiblePopover = false"
            @confirm="toApplyColumnConfig"
          />
        </template>
        <template #reference>
          <el-button
            class="do-table-control-btn"
            plain
            size="small"
          >
            {{ messages.customColumns }}
          </el-button>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue';

import {
  CRUD_INJECTION_KEY,
  DEFAULT_CUSTOM_COLUMN_MESSAGES,
} from '../composables/useSchemaColumnConfig';
import type { ColumnConfig, CrudContext } from '../types';

import DoConfigColumnDialog from './DoConfigColumnDialog.vue';
import DoReadColumnConfig from './DoReadColumnConfig.vue';

defineOptions({ name: 'DoTableHeader' });

withDefaults(defineProps<{ disabledColumnConfig?: boolean }>(), {
  disabledColumnConfig: true,
});

const crud = inject<CrudContext | null>(CRUD_INJECTION_KEY, null);
const messages = computed(() => crud?.messages || DEFAULT_CUSTOM_COLUMN_MESSAGES);

const visiblePopover = ref(false);
const configDialogRef = ref<InstanceType<typeof DoConfigColumnDialog> | null>(null);
const readConfigRef = ref<InstanceType<typeof DoReadColumnConfig> | null>(null);

function onPopoverShow(): void {
  nextTick(() => readConfigRef.value?.getColumnConfigFromLocal());
}

function toCustomColumn(currentConfig?: ColumnConfig): void {
  configDialogRef.value?.showConfigColumnDialog(currentConfig);
}

function toApplyColumnConfig(config: ColumnConfig): void {
  crud?.applyColumnConfig(config);
}

function toRemoveConfig(label: string): void {
  crud?.removeConfigFromLocal(label);
}
</script>

<style scoped>
.do-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.table-batch {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.table-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
