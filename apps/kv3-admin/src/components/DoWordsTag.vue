<template>
  <div
    class="do-words-tag"
    :class="{ 'is-inline-recommend': recommendLayout === 'inline' }"
  >
    <div class="do-words-tag-layer">
      <div class="do-words-tag-panel">
        <div class="do-words-tag-header">
          <el-input
            ref="inputRef"
            v-model="draftText"
            clearable
            :disabled="isAtMax"
            :placeholder="inputPlaceholder"
            @input="onDraftInput"
            @keyup.enter="addFromInput"
          >
            <template #append>
              <el-button
                :disabled="isAtMax"
                @click="addFromInput"
              >
                添加(回车键)
              </el-button>
            </template>
          </el-input>
        </div>

        <div
          v-if="recommends.length && recommendLayout === 'inline'"
          class="do-words-tag-recommend-inline"
        >
          <span class="do-words-tag-recommend-inline-label">推荐{{ tipsMain }}</span>
          <div class="do-words-tag-recommend-inline-list">
            <span
              v-for="(item, index) in recommends"
              :key="`${item}-${index}`"
              class="do-words-tag-recommend-chip"
              :class="{ 'is-active': tagList.includes(item) }"
              role="button"
              tabindex="0"
              @click="toggleTag(item)"
              @keyup.enter="toggleTag(item)"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <div class="do-words-tag-body">
          <div class="do-words-tag-card">
            <div class="do-words-tag-card-hd">
              <div class="do-words-tag-card-hd-left">
                <span class="do-words-tag-main-tips">已添加{{ tipsMain }}</span>
                <span
                  v-if="maxCount > 0"
                  class="do-words-tag-count-tips"
                >
                  {{ tagList.length }}/{{ maxCount }}
                </span>
              </div>
              <button
                type="button"
                class="do-words-tag-clear-btn"
                @click="clearTags"
              >
                <span>清空</span>
                <el-icon><Refresh /></el-icon>
              </button>
            </div>
            <div class="do-words-tag-chosen-list">
              <div
                v-for="(tag, index) in tagList"
                :key="`${tag}-${index}`"
                class="do-words-tag-chosen-item"
              >
                <div
                  class="do-words-tag-chosen-cell"
                  :title="tag"
                >
                  <span>{{ tag }}</span>
                  <button
                    type="button"
                    class="do-words-tag-chosen-remove"
                    aria-label="移除"
                    @click="removeAt(index)"
                  >
                    <el-icon><Close /></el-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="recommends.length && recommendLayout === 'aside'"
        class="do-words-tag-aside"
      >
        <div class="do-words-tag-recommend-title">推荐{{ tipsMain }}：</div>
        <div class="do-words-tag-recommend-card">
          <div class="do-words-tag-recommend-scroller">
            <div
              v-for="(item, index) in recommends"
              :key="`${item}-${index}`"
              class="do-words-tag-recommend-item"
              :class="{ 'is-active': tagList.includes(item) }"
              @click="toggleTag(item)"
            >
              <span
                class="do-words-tag-recommend-check"
                :class="{ 'is-active': tagList.includes(item) }"
              >
                <el-icon v-if="tagList.includes(item)"><Check /></el-icon>
              </span>
              <span class="do-words-tag-recommend-label">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Close, Refresh } from '@element-plus/icons-vue';
import { getTextLength } from '@ku-utils/utils';
import { ElMessage } from 'element-plus/es';
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string[] | null;
    tipsMain?: string;
    max?: number;
    tagLength?: number;
    minTagLength?: number;
    recommends?: string[];
    recommendLayout?: 'aside' | 'inline';
  }>(),
  {
    modelValue: () => [],
    tipsMain: '标签',
    max: 10,
    tagLength: 9,
    minTagLength: 0,
    recommends: () => [],
    recommendLayout: 'aside',
  },
);

const emit = defineEmits<{
  'update:modelValue': [string[]];
  change: [string[]];
}>();

const inputRef = ref<{ focus?: () => void } | null>(null);
const draftText = ref('');
const tagList = ref<string[]>([]);

const maxCount = computed(() => (Number(props.max) > 0 ? Number(props.max) : 0));
const maxTagLength = computed(() => (Number(props.tagLength) > 0 ? Number(props.tagLength) : 0));
const minTagLength = computed(() =>
  Number(props.minTagLength) > 0 ? Number(props.minTagLength) : 0,
);
const isAtMax = computed(() => maxCount.value > 0 && tagList.value.length >= maxCount.value);

const inputPlaceholder = computed(() => {
  if (isAtMax.value) return `最多添加${maxCount.value}个${props.tipsMain}`;
  if (props.tipsMain && maxTagLength.value > 0) {
    return `每个${props.tipsMain}最多${maxTagLength.value}个字符`;
  }
  return '请输入';
});

function sameList(a: string[] | null | undefined, b: string[] | null | undefined) {
  const left = a || [];
  const right = b || [];
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

function emitList(next: string[]) {
  if (sameList(next, props.modelValue)) return;
  emit('update:modelValue', next);
  emit('change', next);
}

function cutByVisualLength(text: string, maxLen: number) {
  if (getTextLength(text) <= maxLen) return text;
  let len = 0;
  let result = '';
  for (const ch of text) {
    const chLen = getTextLength(ch);
    if (len + chLen > maxLen) break;
    len += chLen;
    result += ch;
  }
  return result;
}

function onDraftInput(value: string | number) {
  const text = String(value ?? '');
  if (!maxTagLength.value) {
    draftText.value = text;
    return;
  }
  draftText.value = cutByVisualLength(text, maxTagLength.value);
}

function focusInput() {
  inputRef.value?.focus?.();
}

function addTag(raw: string, options?: { fromInput?: boolean; toggle?: boolean }) {
  const text = (raw || '').trim();
  if (!text) return;

  if (options?.fromInput) {
    const len = getTextLength(text);
    if (maxTagLength.value > 0 && len > maxTagLength.value) {
      ElMessage.warning(`长度必须小于等于${maxTagLength.value}`);
      focusInput();
      return;
    }
    if (minTagLength.value > 0 && len < minTagLength.value) {
      ElMessage.warning(`长度必须大于等于${minTagLength.value}`);
      focusInput();
      return;
    }
    draftText.value = '';
    focusInput();
  }

  const foundIndex = tagList.value.findIndex((item) => item === text);
  if (foundIndex >= 0) {
    if (options?.toggle) removeAt(foundIndex);
    return;
  }

  if (maxCount.value > 0 && tagList.value.length >= maxCount.value) {
    ElMessage.warning(`最多添加${maxCount.value}个${props.tipsMain}`);
    return;
  }

  const next = [...tagList.value, text];
  tagList.value = next;
  emitList(next);
}

function addFromInput() {
  addTag(draftText.value, { fromInput: true });
}

function toggleTag(text: string) {
  addTag(text, { toggle: true });
}

function removeAt(index: number) {
  if (index < 0) return;
  const next = [...tagList.value];
  next.splice(index, 1);
  tagList.value = next;
  emitList(next);
}

function clearTags() {
  if (!tagList.value.length) return;
  tagList.value = [];
  emitList([]);
}

watch(
  () => props.modelValue,
  (value) => {
    const next = [...(value || [])];
    if (!sameList(next, tagList.value)) {
      tagList.value = next;
    }
  },
  { deep: true, immediate: true },
);
</script>

<style lang="scss" scoped>
.do-words-tag {
  box-sizing: border-box;
  width: 100%;
  height: 260px;
  overflow: hidden;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
}

.do-words-tag.is-inline-recommend {
  height: auto;
  min-height: 168px;
  max-height: 360px;
}

.do-words-tag-layer {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.do-words-tag.is-inline-recommend .do-words-tag-layer {
  flex-direction: column;
}

.do-words-tag-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.do-words-tag-header {
  flex-shrink: 0;
}

.do-words-tag-recommend-inline {
  box-sizing: border-box;
  margin-top: 8px;
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background-color: color-mix(in srgb, var(--primary-color) 4%, var(--bg-card));
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.do-words-tag-recommend-inline-label {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 20px;
}

.do-words-tag-recommend-inline-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.do-words-tag-recommend-chip {
  box-sizing: border-box;
  padding: 0 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 2px;
  background-color: var(--bg-card);
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 26px;
  cursor: pointer;
}

.do-words-tag-recommend-chip:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.do-words-tag-recommend-chip.is-active {
  border-color: var(--el-color-success);
  background-color: color-mix(in srgb, var(--el-color-success) 8%, transparent);
  color: var(--el-color-success);
}

.do-words-tag-body {
  box-sizing: border-box;
  margin-top: 6px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.do-words-tag-card {
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background: var(--bg-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.do-words-tag-card-hd {
  box-sizing: border-box;
  min-height: 36px;
  padding: 0 12px;
  border-bottom: 1px solid var(--border-light);
  background: var(--el-fill-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.do-words-tag-card-hd-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.do-words-tag-main-tips {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.do-words-tag-count-tips {
  color: var(--el-text-color-regular);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.do-words-tag-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.do-words-tag-chosen-list {
  box-sizing: border-box;
  padding: 6px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.do-words-tag-chosen-item {
  box-sizing: border-box;
  padding: 3px;
  max-width: 50%;
}

.do-words-tag-chosen-cell {
  box-sizing: border-box;
  padding: 3px 12px;
  border-radius: 2px;
  background-color: var(--el-fill-color-light);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  transition: padding 0.2s linear;
}

.do-words-tag-chosen-remove {
  box-sizing: border-box;
  width: 16px;
  height: 100%;
  min-height: 24px;
  padding: 0;
  border: 0;
  border-radius: 0 2px 2px 0;
  background-color: var(--el-color-danger);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.2s linear;
}

.do-words-tag-chosen-cell:hover {
  padding: 3px 20px 3px 4px;
}

.do-words-tag-chosen-cell:hover .do-words-tag-chosen-remove {
  opacity: 1;
}

.do-words-tag-aside {
  box-sizing: border-box;
  width: 280px;
  max-width: 42%;
  flex-shrink: 0;
  margin-left: 12px;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.do-words-tag-recommend-title {
  box-sizing: border-box;
  padding: 0 8px 0 4px;
  white-space: nowrap;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 32px;
}

.do-words-tag-recommend-card {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
}

.do-words-tag-recommend-scroller {
  box-sizing: border-box;
  padding: 6px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.do-words-tag-recommend-item {
  box-sizing: border-box;
  padding: 6px 8px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s linear;
}

.do-words-tag-recommend-item:hover {
  background-color: var(--el-fill-color-light);
}

.do-words-tag-recommend-check {
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  font-size: 12px;
  background: var(--bg-card);
}

.do-words-tag-recommend-check.is-active {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
}

.do-words-tag-recommend-label {
  min-width: 0;
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.4;
}
</style>
