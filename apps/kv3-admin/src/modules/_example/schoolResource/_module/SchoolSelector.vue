<template>
  <div
    ref="rootRef"
    class="school-selector"
    :class="{ 'is-empty': isEmpty, 'is-multiple': isMultiple }"
    @mouseenter="onHoverEnter"
    @mouseleave="onHoverLeave"
  >
    <el-select
      ref="selectRef"
      class="school-selector-trigger"
      :model-value="selectModel"
      :multiple="isMultiple"
      :clearable="clearable"
      :disabled="disabled"
      :placeholder="placeholder || '请选择学校'"
      :collapse-tags="isMultiple"
      :collapse-tags-tooltip="false"
      :max-collapse-tags="1"
      popper-class="school-selector-dropdown"
      @visible-change="onVisibleChange"
      @clear="clearValue"
      @remove-tag="(id: unknown) => onRemoveTag(String(id))"
    >
      <el-option
        v-for="item in selectedList"
        :key="String(item.id)"
        :label="item.label"
        :value="item.id"
      />
    </el-select>

    <Teleport to="body">
      <div
        v-show="tagsPanelVisible"
        class="do-selector-tags-panel"
        :style="tagsPanelStyle"
        @mouseenter="onHoverEnter"
        @mouseleave="onHoverLeave"
      >
        <el-tag
          v-for="item in selectedList"
          :key="String(item.id)"
          class="do-selector-tag"
          size="small"
          closable
          disable-transitions
          @close="onRemoveTag(String(item.id))"
        >
          {{ item.label }}
        </el-tag>
      </div>
    </Teleport>

    <DialogSelectSchoolResource
      ref="dialogSelectRef"
      :multiple="isMultiple"
      :lock-enabled-status="lockEnabledStatus"
      :default-page-size="defaultPageSize"
      @change="onPickerChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { SelectInstance } from 'element-plus';
import { computed, nextTick, onBeforeUnmount, ref, type CSSProperties } from 'vue';

import type { SchoolResourceRow } from '../_api';

import DialogSelectSchoolResource from './DialogSelectSchoolResource.vue';
import { toSchoolPick, type SchoolSelectorValue } from './types';

const props = withDefaults(
  defineProps<{
    modelValue?: SchoolSelectorValue | SchoolSelectorValue[] | null;
    multiple?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    placeholder?: string;
    lockEnabledStatus?: boolean;
    defaultPageSize?: number;
  }>(),
  {
    modelValue: null,
    multiple: false,
    disabled: false,
    clearable: true,
    placeholder: undefined,
    lockEnabledStatus: true,
    defaultPageSize: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: SchoolSelectorValue | SchoolSelectorValue[] | null];
  change: [value: SchoolSelectorValue | SchoolSelectorValue[] | null];
}>();

const rootRef = ref<HTMLElement>();
const selectRef = ref<SelectInstance>();
const dialogSelectRef = ref<InstanceType<typeof DialogSelectSchoolResource>>();
const hoverActive = ref(false);
const tagsPanelStyle = ref<CSSProperties>({});
const isMultiple = computed(() => !!props.multiple);
let showHoverTimer: ReturnType<typeof setTimeout> | null = null;
let hideHoverTimer: ReturnType<typeof setTimeout> | null = null;
const HOVER_SHOW_DELAY_MS = 300;
const HOVER_HIDE_DELAY_MS = 140;

const selectedList = computed<SchoolSelectorValue[]>(() => {
  const value = props.modelValue;
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
});

const isEmpty = computed(() => selectedList.value.length === 0);

const tagsPanelVisible = computed(
  () => isMultiple.value && !props.disabled && selectedList.value.length > 0 && hoverActive.value,
);

const selectModel = computed<string | Array<string> | undefined>(() => {
  if (isMultiple.value) {
    return selectedList.value.map((item) => item.id);
  }
  return selectedList.value[0]?.id;
});

function emitValue(next: SchoolSelectorValue | SchoolSelectorValue[] | null) {
  emit('update:modelValue', next);
  emit('change', next);
}

function updateTagsPanelPosition() {
  const el = rootRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const width = Math.max(rect.width, 240);
  tagsPanelStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${Math.max(8, rect.top - 6)}px`,
    transform: 'translateY(-100%)',
    width: `${width}px`,
    zIndex: 4000,
  };
}

function bindPositionListeners() {
  window.addEventListener('scroll', updateTagsPanelPosition, true);
  window.addEventListener('resize', updateTagsPanelPosition);
}

function unbindPositionListeners() {
  window.removeEventListener('scroll', updateTagsPanelPosition, true);
  window.removeEventListener('resize', updateTagsPanelPosition);
}

function clearShowHoverTimer() {
  if (!showHoverTimer) return;
  clearTimeout(showHoverTimer);
  showHoverTimer = null;
}

function clearHideHoverTimer() {
  if (!hideHoverTimer) return;
  clearTimeout(hideHoverTimer);
  hideHoverTimer = null;
}

function clearHoverTimers() {
  clearShowHoverTimer();
  clearHideHoverTimer();
}

function showTagsPanel() {
  hoverActive.value = true;
  nextTick(() => {
    updateTagsPanelPosition();
    bindPositionListeners();
  });
}

function onHoverEnter() {
  if (!isMultiple.value || props.disabled || !selectedList.value.length) return;
  clearHideHoverTimer();
  if (hoverActive.value) return;
  clearShowHoverTimer();
  showHoverTimer = setTimeout(() => {
    showHoverTimer = null;
    showTagsPanel();
  }, HOVER_SHOW_DELAY_MS);
}

function onHoverLeave() {
  clearShowHoverTimer();
  clearHideHoverTimer();
  hideHoverTimer = setTimeout(() => {
    hoverActive.value = false;
    unbindPositionListeners();
    hideHoverTimer = null;
  }, HOVER_HIDE_DELAY_MS);
}

function blurSelect() {
  nextTick(() => {
    selectRef.value?.blur();
  });
}

function openPicker() {
  if (props.disabled) return;
  const rows = selectedList.value.map((item) => item.item);
  const ids = selectedList.value.map((item) => item.id);
  dialogSelectRef.value?.show(ids, rows);
}

function onVisibleChange(visible: boolean) {
  if (!visible || props.disabled) return;
  blurSelect();
  openPicker();
}

function onPickerChange(value: SchoolResourceRow | SchoolResourceRow[] | undefined) {
  if (isMultiple.value) {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    emitValue(list.map((row) => toSchoolPick(row)));
    return;
  }
  const row = Array.isArray(value) ? value[0] : value;
  emitValue(row ? toSchoolPick(row) : null);
}

function clearValue() {
  emitValue(isMultiple.value ? [] : null);
  clearHoverTimers();
  hoverActive.value = false;
  unbindPositionListeners();
}

function onRemoveTag(id: string) {
  if (!isMultiple.value) return;
  const next = selectedList.value.filter((item) => String(item.id) !== String(id));
  emitValue(next);
  nextTick(() => {
    if (!next.length) {
      clearHoverTimers();
      hoverActive.value = false;
      unbindPositionListeners();
      return;
    }
    updateTagsPanelPosition();
  });
}

onBeforeUnmount(() => {
  clearHoverTimers();
  unbindPositionListeners();
});
</script>

<style lang="scss" scoped>
.school-selector {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  min-width: 200px;
  vertical-align: middle;
  line-height: normal;
}

.school-selector-trigger {
  width: 100%;

  :deep(.el-select__wrapper) {
    box-sizing: border-box;
    min-height: var(--el-component-size);
  }
}

.school-selector.is-empty .school-selector-trigger {
  :deep(.el-select__wrapper) {
    height: var(--el-component-size);
  }
}
</style>

<style lang="scss">
.school-selector-dropdown.el-select__popper,
.school-selector-dropdown {
  display: none !important;
}

.do-selector-tags-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  box-sizing: border-box;
  padding: 8px 10px;
  background: var(--ku-bg-card-elevated, #fcf8f2);
  border: 1px solid var(--ku-border-light, #ddd4c6);
  border-radius: 6px;
  box-shadow: var(--ku-box-shadow-light, 0 2px 12px rgba(0, 0, 0, 0.08));
}

.do-selector-tag {
  max-width: 100%;
}
</style>
