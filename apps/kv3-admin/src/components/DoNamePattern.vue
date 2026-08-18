<template>
  <div class="do-name-pattern">
    <el-input
      ref="inputRef"
      :model-value="innerValue"
      :type="textarea ? 'textarea' : 'text'"
      :rows="textarea ? 2 : undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      autocomplete="off"
      @click="showPatternPopover"
      @focus="showPatternPopover"
      @blur="recordCursor"
      @update:model-value="onInput"
    >
      <template
        v-if="$slots.append"
        #append
      >
        <slot name="append" />
      </template>
    </el-input>

    <div
      v-show="usePopover ? visiblePatternPopover : true"
      v-click-outside="hidePatternPopover"
      class="do-name-pattern-popover"
      :class="{
        active: visiblePatternPopover,
        'bottom-list': !usePopover,
      }"
      :style="usePopover && visiblePatternPopover ? cssPatternPopover : undefined"
    >
      <div class="do-name-pattern-arrow" />
      <div class="do-name-pattern-panel">
        <ul class="do-name-pattern-list">
          <li
            v-for="token in resolvedPatternList"
            :key="token"
            class="do-name-pattern-option"
            @mousedown.prevent
            @click.stop="choosePattern(token)"
          >
            <span class="do-name-pattern-token">{{ token }}</span>
          </li>
        </ul>
        <div
          v-if="tipText"
          class="do-name-pattern-tip"
        >
          {{ tipText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClickOutside as vClickOutside } from 'element-plus';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

defineOptions({ name: 'DoNamePattern' });

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    /** 可插入通配符；不传则用组件内默认列表 */
    patternList?: string[];
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    /** 是否允许多行（禁用以去掉换行） */
    allowWrap?: boolean;
    /** 插入前自动补连接符（如 `-` / `_`） */
    splitSign?: string;
    /** 同一通配符仅允许出现一次 */
    useOnly?: boolean;
    /** true：浮层；false：输入框下方芯片列表（对齐智擎项目命名） */
    usePopover?: boolean;
    textarea?: boolean;
    tip?: string;
  }>(),
  {
    modelValue: '',
    patternList: undefined,
    placeholder: '请输入命名规则',
    disabled: false,
    clearable: true,
    allowWrap: true,
    splitSign: undefined,
    useOnly: false,
    usePopover: false,
    textarea: false,
    tip: undefined,
  },
);
const emit = defineEmits<{
  'update:modelValue': [string];
  change: [string];
}>();
const DEFAULT_PATTERNS = ['{date}', '{time}', '{seq}'];
const DEFAULT_SPLIT_SIGN = '-';
const DEFAULT_TIP = '点击插入通配符；同一通配符默认可重复使用';

const inputRef = ref<{
  focus: () => void;
  $el?: HTMLElement;
  input?: HTMLInputElement | HTMLTextAreaElement;
  textarea?: HTMLTextAreaElement;
} | null>(null);

const innerValue = ref('');
const visiblePatternPopover = ref(false);
const canClosePatternPopover = ref(false);
const cursorPosition = ref(0);
const activeInput = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const cssPatternPopover = ref<Record<string, string>>({});

const resolvedPatternList = computed(() => {
  if (props.patternList?.length) return props.patternList;
  return DEFAULT_PATTERNS;
});

const resolvedSplitSign = computed(() => props.splitSign ?? DEFAULT_SPLIT_SIGN);

const tipText = computed(() => props.tip ?? DEFAULT_TIP);

watch(
  () => props.modelValue,
  (value) => {
    const next = value == null ? '' : String(value);
    if (next !== innerValue.value) {
      innerValue.value = next;
    }
  },
  { immediate: true },
);

watch(innerValue, (value) => {
  const next = value == null ? '' : String(value);
  if (next === (props.modelValue ?? '')) return;
  emit('update:modelValue', next);
  emit('change', next);
});

function getNativeInput() {
  const comp = inputRef.value as unknown as {
    textarea?: HTMLTextAreaElement;
    input?: HTMLInputElement;
    $el?: HTMLElement;
  } | null;
  if (!comp) return null;
  if (comp.textarea) return comp.textarea;
  if (comp.input) return comp.input;
  const root = comp.$el;
  if (!root) return null;
  return (
    (root.querySelector('textarea') as HTMLTextAreaElement | null) ||
    (root.querySelector('input') as HTMLInputElement | null)
  );
}

function recordCursor() {
  const el = activeInput.value || getNativeInput();
  if (el && typeof el.selectionStart === 'number') {
    cursorPosition.value = el.selectionStart;
  }
}

function handleSelectionChange() {
  const el = activeInput.value;
  if (el && document.activeElement === el) {
    recordCursor();
  }
}

function onInput(value: string) {
  if (props.allowWrap) {
    innerValue.value = value;
    return;
  }
  innerValue.value = value.replace(/\n/g, '');
}

function choosePattern(token: string) {
  if (props.disabled) return;
  const current = innerValue.value || '';
  if (!current) {
    innerValue.value = token;
    nextTick(() => {
      inputRef.value?.focus();
      const el = getNativeInput();
      if (el) {
        activeInput.value = el;
        cursorPosition.value = token.length;
        el.setSelectionRange?.(token.length, token.length);
      }
    });
    return;
  }
  if (props.useOnly && current.includes(token)) {
    nextTick(() => inputRef.value?.focus());
    return;
  }

  const pos =
    activeInput.value && cursorPosition.value <= current.length
      ? cursorPosition.value
      : current.length;
  const sign = resolvedSplitSign.value;
  const appendStr = sign
    ? current.slice(0, pos).endsWith(sign) || pos === 0
      ? token
      : `${sign}${token}`
    : token;
  const beforeText = current.slice(0, pos);
  const afterText = current.slice(pos);
  // 若光标前已有连接符、或 after 以连接符开头，避免重复
  let insert = appendStr;
  if (sign && beforeText.endsWith(sign) && insert.startsWith(sign)) {
    insert = insert.slice(sign.length);
  }
  if (sign && afterText.startsWith(sign) && insert.endsWith(sign)) {
    insert = insert.slice(0, -sign.length);
  }
  innerValue.value = `${beforeText}${insert}${afterText}`;
  nextTick(() => {
    const el = getNativeInput();
    if (!el) {
      inputRef.value?.focus();
      return;
    }
    activeInput.value = el;
    const nextPos = pos + insert.length;
    cursorPosition.value = nextPos;
    el.focus();
    el.setSelectionRange?.(nextPos, nextPos);
  });
}

function showPatternPopover(evt: FocusEvent | MouseEvent) {
  if (props.disabled) return;
  const target = evt.target as HTMLInputElement | HTMLTextAreaElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    activeInput.value = target;
    recordCursor();
  } else {
    activeInput.value = getNativeInput();
    recordCursor();
  }
  if (!resolvedPatternList.value.length || !props.usePopover) return;

  const root = (inputRef.value as unknown as { $el?: HTMLElement } | null)?.$el;
  if (!root?.getBoundingClientRect) return;
  const posInfo = root.getBoundingClientRect();
  cssPatternPopover.value = {
    top: `${posInfo.top + posInfo.height}px`,
    left: `${posInfo.left}px`,
    width: `${posInfo.width}px`,
  };
  canClosePatternPopover.value = false;
  visiblePatternPopover.value = true;
  window.setTimeout(() => {
    canClosePatternPopover.value = true;
  }, 300);
}

function hidePatternPopover() {
  if (!props.usePopover) return;
  if (visiblePatternPopover.value && canClosePatternPopover.value) {
    visiblePatternPopover.value = false;
    canClosePatternPopover.value = false;
  }
}

onMounted(() => {
  document.addEventListener('selectionchange', handleSelectionChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', handleSelectionChange);
});
</script>

<style lang="scss" scoped>
.do-name-pattern {
  width: 100%;
}

.do-name-pattern-popover {
  box-sizing: border-box;
  padding-top: 18px;
  width: 224px;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: -99999px;
  left: -99999px;
  z-index: 4000;
  opacity: 0;
  transition: opacity 0.2s linear;

  &.active {
    opacity: 1;
  }

  &.bottom-list {
    padding-top: 0;
    width: 100%;
    position: static;
    opacity: 1;

    .do-name-pattern-arrow {
      display: none;
    }

    .do-name-pattern-panel {
      background: transparent;
      border: 0;
      box-shadow: none;
    }

    .do-name-pattern-list {
      padding: 6px 0 0;
      flex-direction: row;
      flex-wrap: wrap;

      &::before {
        display: inline-block;
        padding-right: 6px;
        content: '通配符:';
        height: 28px;
        line-height: 28px;
        color: var(--el-text-color-secondary);
        font-size: 13px;
      }
    }

    .do-name-pattern-option {
      padding: 0 6px;
      border-radius: 4px;
    }

    .do-name-pattern-token {
      color: var(--primary-color);
      line-height: 28px;
      height: 28px;

      &::before {
        content: '+';
      }
    }
  }
}

.do-name-pattern-arrow {
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-width: 0;
  border-bottom-color: var(--el-border-color-light);
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);

  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: -6px;
    border: 6px solid transparent;
    border-top-width: 0;
    border-bottom-color: var(--bg-card, var(--el-bg-color-overlay));
  }
}

.do-name-pattern-panel {
  width: 100%;
  background: var(--bg-card, var(--el-bg-color-overlay));
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 4px;
  overflow: auto;
}

.do-name-pattern-list {
  margin: 0;
  padding: 6px 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.do-name-pattern-option {
  padding: 0 16px;
  cursor: pointer;
  transition: background-color 0.2s linear;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.do-name-pattern-token {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  white-space: nowrap;
}

.do-name-pattern-tip {
  padding: 0 4px 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}

.do-name-pattern-popover.bottom-list .do-name-pattern-tip {
  padding: 4px 0 0;
}
</style>
