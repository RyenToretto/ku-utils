<template>
  <el-drawer
    v-model="visible"
    class="do-config-column-dialog"
    :append-to-body="true"
    size="1000px"
    direction="rtl"
    :before-close="handleBeforeClose"
  >
    <template #header>
      <span class="drawer-title">
        {{ messages.customColumns }}
        <span
          class="tips"
          :class="newConfigName === noNameLabel ? 'status-warning' : 'status-success'"
        >
          ({{ newConfigName }})
        </span>
      </span>
    </template>

    <div class="drawer-wrap">
      <div class="col-dialog-body">
        <div class="cfg-search">
          <el-input
            v-model="searchKeyword"
            :placeholder="messages.searchPlaceholder"
            clearable
            size="small"
            :prefix-icon="Search"
          />
        </div>

        <div class="cfg-panels">
          <div class="cfg-left">
            <div
              v-for="group in uniqueGroups"
              :key="group"
              class="nav-link"
              :class="{ active: activeNavGroup === group }"
              @click="scrollToGroup(group)"
            >
              {{ group }}
            </div>
          </div>

          <div
            ref="midPanel"
            class="cfg-mid"
            @scroll="onMidScroll"
          >
            <div
              v-for="group in filteredGroups"
              :key="group.label"
              :ref="(el) => setGroupRef(group.label, el)"
              class="grp-section"
            >
              <div class="grp-head">
                <span class="grp-label">{{ group.label }}</span>
                <span class="grp-actions">
                  <a
                    href="javascript:"
                    @click="groupAllSelect(group.label)"
                  >
                    {{ messages.selectAll }}
                  </a>
                  <a
                    href="javascript:"
                    @click="groupReverseSelect(group.label)"
                  >
                    {{ messages.invertSelection }}
                  </a>
                </span>
              </div>
              <div class="grp-grid">
                <div
                  v-for="col in group.children"
                  :key="col.property"
                  class="grp-item"
                >
                  <el-checkbox
                    v-model="col.visible"
                    :disabled="unableToControl(col)"
                    @change="(checked: boolean) => toggleColumnCheck(checked, col)"
                  >
                    {{ col.label }}
                  </el-checkbox>
                </div>
              </div>
            </div>
            <div
              v-if="filteredGroups.length === 0"
              class="grp-empty"
            >
              {{ messages.emptySearch }}
            </div>
          </div>

          <div class="cfg-right">
            <div class="sel-header">
              <span class="sel-count">{{ messages.selectedCount(selectedCount, maxCount) }}</span>
              <a
                class="sel-reset"
                href="javascript:"
                @click="resetConfig"
              >
                {{ messages.reset }}
              </a>
            </div>

            <div class="sel-body">
              <template v-if="fixedSelectedCols.length">
                <div class="sel-fix-zone">
                  <div
                    v-for="col in fixedSelectedCols"
                    :key="col.property"
                    class="sel-fix-row"
                  >
                    <el-icon class="sel-lock"><Lock /></el-icon>
                    <span class="sel-fix-name">{{ col.label }}</span>
                  </div>
                </div>
                <div class="sel-sepline">
                  <span class="sel-septip">{{ messages.fixedColumnsTip }}</span>
                </div>
              </template>

              <div class="sel-drag-zone">
                <VueDraggable
                  v-model="draggableModel"
                  :animation="200"
                  handle=".sel-drag-handle"
                  @update="onDragReorder"
                >
                  <div
                    v-for="col in draggableModel"
                    :key="col.property"
                    class="sel-drag-row"
                  >
                    <span class="sel-drag-handle">
                      <span class="sel-drag-dots" />
                    </span>
                    <span
                      class="sel-drag-name"
                      :title="col.label"
                    >
                      {{ col.label }}
                    </span>
                    <el-icon
                      class="sel-remove"
                      @click="removeSelectedItem(col.property)"
                    >
                      <Close />
                    </el-icon>
                  </div>
                </VueDraggable>
                <div
                  v-if="draggableModel.length === 0"
                  class="sel-empty"
                >
                  {{ messages.emptySelected }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="drawer-foot">
        <div class="left-btn-group">
          <el-popover
            v-model:visible="popperSaveToLocal"
            placement="top"
            popper-class="save-to-local-popper"
            trigger="manual"
            :width="520"
          >
            <template #default>
              <div class="save-to-local-form">
                <el-input
                  ref="inputConfigName"
                  v-model="newConfigName"
                  class="storage-key-will-save"
                  :placeholder="messages.configNamePlaceholder"
                />
                <el-button
                  plain
                  size="small"
                  @click="cancelSaveToLocal"
                >
                  {{ messages.cancel }}
                </el-button>
                <el-button
                  plain
                  size="small"
                  @click="doSaveToLocal"
                >
                  {{ messages.save }}
                </el-button>
              </div>
            </template>
            <template #reference>
              <el-button @click="toSaveToLocal">{{ messages.saveToLocal }}</el-button>
            </template>
          </el-popover>

          <el-popover
            v-model:visible="popperReadFromLocal"
            placement="top"
            popper-class="read-from-local-popper"
            trigger="click"
            :width="240"
          >
            <template #default>
              <DoReadColumnConfig
                ref="readConfigRef"
                @confirm="useReadConfig"
                @remove="removeChooseConfig"
                @closed="popperReadFromLocal = false"
              />
            </template>
            <template #reference>
              <el-button @click="toReadFromLocal">{{ messages.readFromLocal }}</el-button>
            </template>
          </el-popover>
        </div>

        <div class="right-btn-group">
          <el-button @click="cancelColumnConfig">{{ messages.cancel }}</el-button>
          <el-button
            type="primary"
            @click="confirmColumnConfig"
          >
            {{ messages.complete }}
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { Close, Lock, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, inject, nextTick, ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

import {
  CRUD_INJECTION_KEY,
  DEFAULT_CUSTOM_COLUMN_MESSAGES,
} from '../composables/useSchemaColumnConfig';
import type { ColumnConfig, CrudContext, TableColumnMeta } from '../types';

import DoReadColumnConfig from './DoReadColumnConfig.vue';

defineOptions({ name: 'DoConfigColumnDialog' });

const emit = defineEmits<{ confirm: [config: ColumnConfig] }>();

const crud = inject<CrudContext | null>(CRUD_INJECTION_KEY, null);

const visible = ref(false);
const popperSaveToLocal = ref(false);
const popperReadFromLocal = ref(false);
const columnList = ref<TableColumnMeta[]>([]);
const emitColumnConfig = ref<TableColumnMeta[]>([]);
const messages = computed(() => crud?.messages || DEFAULT_CUSTOM_COLUMN_MESSAGES);
const newConfigName = ref(crud?.noNameLabel || messages.value?.noNameLabel || '');
const searchKeyword = ref('');
const activeNavGroup = ref('');

const midPanel = ref<HTMLElement | null>(null);
const readConfigRef = ref<InstanceType<typeof DoReadColumnConfig> | null>(null);
const inputConfigName = ref<{ focus: () => void } | null>(null);
const groupRefs = new Map<string, HTMLElement>();

function setGroupRef(label: string, el: unknown): void {
  if (el) groupRefs.set(label, (el as { $el?: HTMLElement }).$el || (el as HTMLElement));
  else groupRefs.delete(label);
}

const noNameLabel = computed(() => crud?.noNameLabel || messages.value?.noNameLabel || '');
const maxCount = computed(() => crud?.maxSelectCount || 50);
const selectedCount = computed(() => emitColumnConfig.value.length);

const uniqueGroups = computed(() => {
  const seen = new Set<string>();
  const groups: string[] = [];
  columnList.value.forEach((item) => {
    const g = item.group || messages.value.groupFallback;
    if (!seen.has(g)) {
      seen.add(g);
      groups.push(g);
    }
  });
  return groups;
});

const filteredGroups = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const groupMap = new Map<string, { label: string; children: TableColumnMeta[] }>();
  columnList.value.forEach((item) => {
    const g = item.group || messages.value.groupFallback;
    if (keyword && !item.label.toLowerCase().includes(keyword)) return;
    if (!groupMap.has(g)) groupMap.set(g, { label: g, children: [] });
    groupMap.get(g)!.children.push(item);
  });
  return uniqueGroups.value.filter((g) => groupMap.has(g)).map((g) => groupMap.get(g)!);
});

const alwaysCols = computed<TableColumnMeta[]>(() => {
  const manual = crud?.alwaysVisibleColumns || [];
  return manual.map((col) => ({
    property: col.prop,
    label: col.label,
    fixed: true,
    group: messages.value.groupFallback,
    isLeaf: true,
    visible: true,
    _alwaysVisible: true,
  }));
});

const fixedSelectedCols = computed(() => {
  const schemaFixed = emitColumnConfig.value.filter((col) => unableToControl(col));
  return [...alwaysCols.value, ...schemaFixed];
});

const draggableModel = computed<TableColumnMeta[]>({
  get: () => emitColumnConfig.value.filter((col) => !unableToControl(col)),
  set: () => {
    /* 实际重排由 onDragReorder 处理 */
  },
});

function unableToControl(col: TableColumnMeta): boolean {
  return (
    col.type === 'selection' ||
    col.fixed ||
    col.label === messages.value.operationColumnLabel ||
    col.label === '操作'
  );
}

function applyConfig(columnConfig: ColumnConfig): void {
  if (!crud) return;
  newConfigName.value = columnConfig.label;
  const allColumns = crud.tableColumns.map((item) => ({
    ...item,
    visible: columnConfig.columns.includes(item.property as string),
  }));
  columnList.value = allColumns;
  emitColumnConfig.value = columnConfig.columns
    .map((property) => allColumns.find((col) => col.property === property))
    .filter((col): col is TableColumnMeta => !!col);
}

function showConfigColumnDialog(currentConfig?: ColumnConfig): void {
  if (!crud) return;
  const columnConfig = currentConfig || crud.getDefaultConfig();
  if (!columnConfig) return;
  applyConfig(columnConfig);
  searchKeyword.value = '';
  visible.value = true;
  nextTick(() => {
    if (uniqueGroups.value.length > 0) activeNavGroup.value = uniqueGroups.value[0];
  });
}

function handleBeforeClose(done: () => void): void {
  popperSaveToLocal.value = false;
  popperReadFromLocal.value = false;
  done();
  nextTick(() => crud?.onDialogClose?.());
}

function cancelColumnConfig(): void {
  popperSaveToLocal.value = false;
  popperReadFromLocal.value = false;
  visible.value = false;
  nextTick(() => crud?.onDialogClose?.());
}

function confirmColumnConfig(): void {
  popperSaveToLocal.value = false;
  popperReadFromLocal.value = false;
  visible.value = false;
  emit('confirm', {
    label: newConfigName.value || noNameLabel.value,
    columns: emitColumnConfig.value
      .filter((config) => !config._alwaysVisible)
      .map((config) => config.property as string),
  });
}

function resetConfig(): void {
  if (!crud) return;
  const defaultConfig = crud.getDefaultConfig();
  if (!defaultConfig) return;
  applyConfig(defaultConfig);
  updateNewConfigName();
}

function updateEmitColumnConfig(): void {
  const currentProps = emitColumnConfig.value.map((col) => col.property);
  const newVisibleProps = columnList.value.filter((col) => col.visible).map((col) => col.property);
  emitColumnConfig.value = emitColumnConfig.value.filter((col) =>
    newVisibleProps.includes(col.property),
  );
  newVisibleProps.forEach((property) => {
    if (!currentProps.includes(property)) {
      const col = columnList.value.find((c) => c.property === property);
      if (col) emitColumnConfig.value.push(col);
    }
  });
  updateNewConfigName();
}

function updateNewConfigName(): void {
  if (!crud) return;
  const cache = crud.readCacheConfig();
  if (!cache) return;
  const tempConfig = emitColumnConfig.value.map((item) => item.property);
  let found = false;
  cache.columnConfig.forEach((config) => {
    if (JSON.stringify(config.columns) === JSON.stringify(tempConfig)) {
      found = true;
      newConfigName.value = config.label;
    }
  });
  if (!found) newConfigName.value = noNameLabel.value;
}

function toggleColumnCheck(checked: boolean, col: TableColumnMeta): void {
  if (checked && !unableToControl(col)) {
    const willCount = emitColumnConfig.value.filter((c) => !unableToControl(c)).length + 1;
    if (willCount > maxCount.value) {
      ElMessage.warning(messages.value.maxSelectedWarning(maxCount.value));
      nextTick(() => {
        col.visible = false;
      });
      return;
    }
  }
  updateEmitColumnConfig();
}

function groupAllSelect(group: string): void {
  columnList.value.forEach((item) => {
    if (!unableToControl(item) && (item.group || messages.value.groupFallback) === group) {
      item.visible = true;
    }
  });
  updateEmitColumnConfig();
}

function groupReverseSelect(group: string): void {
  columnList.value.forEach((item) => {
    if (!unableToControl(item) && (item.group || messages.value.groupFallback) === group) {
      item.visible = !item.visible;
    }
  });
  updateEmitColumnConfig();
}

function removeSelectedItem(property?: string): void {
  const col = columnList.value.find((c) => c.property === property);
  if (col) col.visible = false;
  emitColumnConfig.value = emitColumnConfig.value.filter((c) => c.property !== property);
  updateNewConfigName();
}

function onDragReorder(): void {
  const reordered = draggableModel.value;
  const schemaFixed = emitColumnConfig.value.filter(
    (col) => unableToControl(col) && !col._alwaysVisible,
  );
  emitColumnConfig.value = [...schemaFixed, ...reordered];
  updateNewConfigName();
}

function scrollToGroup(group: string): void {
  activeNavGroup.value = group;
  const domEl = groupRefs.get(group);
  const panel = midPanel.value;
  if (domEl && panel) {
    panel.scrollTo({ top: domEl.offsetTop - panel.offsetTop, behavior: 'smooth' });
  }
}

function onMidScroll(): void {
  const panel = midPanel.value;
  if (!panel) return;
  const scrollTop = panel.scrollTop;
  for (let i = uniqueGroups.value.length - 1; i >= 0; i--) {
    const domEl = groupRefs.get(uniqueGroups.value[i]);
    if (!domEl) continue;
    if (domEl.offsetTop - panel.offsetTop <= scrollTop + 8) {
      activeNavGroup.value = uniqueGroups.value[i];
      break;
    }
  }
}

function toReadFromLocal(): void {
  popperSaveToLocal.value = false;
  nextTick(() => readConfigRef.value?.getColumnConfigFromLocal());
}

function removeChooseConfig(label: string): void {
  crud?.removeConfigFromLocal(label);
}

function useReadConfig(config: ColumnConfig): void {
  if (!crud || !config || !config.label || !columnList.value.length) return;
  if (!config.columns || !config.columns.length || config.columns.includes('ALL')) {
    useReadConfig({
      label: config.label,
      columns: crud.tableColumns.map((each) => each.property as string),
    });
    return;
  }
  popperReadFromLocal.value = false;
  newConfigName.value = config.label;
  columnList.value.forEach((item) => {
    item.visible = config.columns.includes(item.property as string);
  });
  emitColumnConfig.value = config.columns
    .map((property) => columnList.value.find((col) => col.property === property))
    .filter((col): col is TableColumnMeta => !!col);
}

function toSaveToLocal(): void {
  newConfigName.value = '';
  popperSaveToLocal.value = true;
  popperReadFromLocal.value = false;
  nextTick(() => inputConfigName.value?.focus?.());
}

function doSaveToLocal(): void {
  if (!crud || !newConfigName.value || !newConfigName.value.trim()) {
    ElMessage.warning(messages.value.configNameRequired);
    return;
  }
  const configName = newConfigName.value.trim();
  const existingConfig = crud.readCacheConfig();
  if (existingConfig?.columnConfig?.some((c) => c.label === configName)) {
    ElMessage.warning(messages.value.configNameExists);
    return;
  }
  crud.saveConfigToLocal(
    configName,
    emitColumnConfig.value.map((config) => config.property as string),
  );
  popperSaveToLocal.value = false;
  ElMessage.success(messages.value.configSaved);
}

function cancelSaveToLocal(): void {
  updateNewConfigName();
  popperSaveToLocal.value = false;
}

defineExpose({ showConfigColumnDialog });
</script>

<style scoped>
.drawer-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.col-dialog-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0 12px;
}

.cfg-search {
  padding: 0 20px;
  flex-shrink: 0;
}

.cfg-panels {
  display: flex;
  flex: 1;
  border: 1px solid var(--ku-border-light, #e5e6eb);
  border-radius: 2px;
  overflow: hidden;
}

.cfg-left {
  width: 240px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid var(--ku-border-light, #e5e6eb);
  background: var(--ku-neutral-50, #fafafa);
  padding: 8px 0;
}

.nav-link {
  padding: 8px 16px;
  font-size: 13px;
  color: var(--ku-text-secondary, #646a73);
  cursor: pointer;
  line-height: 1.4;
  transition:
    background 0.15s,
    color 0.15s;
}

.nav-link:hover {
  background: var(--ku-bg-hover, rgba(51, 112, 255, 0.06));
  color: var(--ku-text-primary, #1f2329);
}

.nav-link.active {
  color: var(--ku-color-primary, #3370ff);
  background: var(--ku-color-primary-bg, #f0f4ff);
  font-weight: 500;
}

.cfg-mid {
  flex: 1;
  overflow-y: auto;
}

.grp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px 8px;
  position: sticky;
  top: 0;
  background: var(--ku-bg-card, #ffffff);
  z-index: 9;
}

.grp-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ku-text-primary, #1f2329);
}

.grp-actions {
  display: flex;
  gap: 8px;
}

.grp-actions a {
  font-size: 12px;
  color: var(--ku-color-primary, #3370ff);
  text-decoration: none;
}

.grp-actions a:hover {
  text-decoration: underline;
}

.grp-grid {
  padding: 0 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
}

.grp-item {
  padding: 4px 0;
}

.grp-item :deep(.el-checkbox) {
  display: flex;
  align-items: center;
  width: 100%;
  margin-right: 0;
}

.grp-item :deep(.el-checkbox__label) {
  font-size: 13px;
  color: var(--ku-text-secondary, #646a73);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grp-empty {
  padding: 48px 16px;
  text-align: center;
  color: var(--ku-text-placeholder, #8f959e);
  font-size: 13px;
}

.cfg-right {
  width: 280px;
  flex-shrink: 0;
  border-left: 1px solid var(--ku-border-light, #e5e6eb);
  display: flex;
  flex-direction: column;
  background: var(--ku-bg-card, #ffffff);
}

.sel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ku-border-light, #e5e6eb);
  background: var(--ku-table-header-bg, #f5f6f7);
  flex-shrink: 0;
}

.sel-count {
  font-size: 13px;
  color: var(--ku-text-secondary, #646a73);
  font-weight: 500;
}

.sel-reset {
  font-size: 12px;
  color: var(--ku-color-primary, #3370ff);
  text-decoration: none;
}

.sel-reset:hover {
  text-decoration: underline;
}

.sel-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sel-fix-zone {
  flex-shrink: 0;
}

.sel-fix-row {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 36px;
  background: var(--ku-table-header-bg, #f5f6f7);
  border-bottom: 1px solid var(--ku-bg-hover, rgba(51, 112, 255, 0.06));
}

.sel-lock {
  font-size: 12px;
  color: var(--ku-text-disabled, #bbbfc4);
  margin-right: 8px;
  flex-shrink: 0;
}

.sel-fix-name {
  font-size: 13px;
  color: var(--ku-text-secondary, #646a73);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sel-sepline {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  flex-shrink: 0;
  background: var(--ku-bg-card, #ffffff);
}

.sel-sepline::before,
.sel-sepline::after {
  content: '';
  flex: 1;
  border-top: 1px dashed var(--ku-border-default, #dee0e3);
}

.sel-septip {
  padding: 0 8px;
  font-size: 11px;
  color: var(--ku-text-disabled, #bbbfc4);
  white-space: nowrap;
}

.sel-drag-zone {
  flex: 1;
}

.sel-drag-row {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 4px 0 8px;
  border-bottom: 1px solid var(--ku-table-header-bg, #f5f6f7);
  transition: background 0.12s;
}

.sel-drag-row:hover {
  background: var(--ku-table-header-bg, #f5f6f7);
}

.sel-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
  cursor: grab;
  flex-shrink: 0;
  color: var(--ku-text-disabled, #bbbfc4);
}

.sel-drag-handle:active {
  cursor: grabbing;
}

.sel-drag-dots {
  display: inline-block;
  width: 6px;
  height: 14px;
  background-image: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
  background-size: 3px 4px;
  background-repeat: repeat;
}

.sel-drag-name {
  flex: 1;
  font-size: 13px;
  color: var(--ku-text-primary, #1f2329);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 4px;
}

.sel-remove {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  font-size: 12px;
  color: var(--ku-text-disabled, #bbbfc4);
  cursor: pointer;
  border-radius: 3px;
  transition:
    color 0.15s,
    background 0.15s;
}

.sel-remove:hover {
  color: var(--ku-color-danger, #f54a45);
  background: var(--ku-color-danger-bg, #fef1f1);
}

.sel-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--ku-text-disabled, #bbbfc4);
}

.drawer-foot {
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-top: 1px solid var(--ku-border-light, #e5e6eb);
}

.left-btn-group > button {
  margin-left: 0;
  margin-right: 10px;
}

.drawer-title .tips.status-warning {
  color: var(--ku-color-warning, #ff8800);
}

.drawer-title .tips.status-success {
  color: var(--ku-color-success, #34c724);
}

.save-to-local-form {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

<style>
.do-config-column-dialog .el-drawer__body {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
