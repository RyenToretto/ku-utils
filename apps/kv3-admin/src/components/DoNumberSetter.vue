<template>
  <span class="do-number-setter">
    <span class="do-number-setter-label">
      <slot />
    </span>

    <el-popover
      v-if="!disabled"
      ref="popoverRef"
      trigger="click"
      placement="bottom-end"
      :width="220"
      :disabled="changing"
      popper-class="do-number-setter-popper"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
      @before-leave="editing = false"
      @after-leave="onAfterLeave"
    >
      <div class="do-number-setter-popover">
        <div
          v-if="label"
          class="do-number-setter-title"
        >
          {{ label }}
        </div>
        <el-form
          ref="refForm"
          :model="form"
          :rules="rules"
          @submit.prevent
        >
          <el-form-item prop="newValue">
            <el-input-number
              ref="inputRef"
              v-model="form.newValue"
              class="do-number-setter-input"
              :min="+minNum"
              :max="Number.MAX_SAFE_INTEGER"
              :placeholder="resolvedPlaceholder"
              @keydown.enter.prevent="confirm"
            />
          </el-form-item>
        </el-form>
        <div class="do-number-setter-footer">
          <el-button
            size="small"
            @click="close"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="confirm"
          >
            确定
          </el-button>
        </div>
      </div>

      <template #reference>
        <span
          v-if="$slots.reference"
          class="do-number-setter-reference"
        >
          <slot name="reference" />
        </span>
        <span
          v-else
          class="do-number-setter-control"
          :class="{ 'is-changing': changing, 'is-active': editing }"
        >
          <el-icon
            v-if="changing"
            class="do-rotate"
          >
            <Loading />
          </el-icon>
          <el-icon v-else>
            <Edit />
          </el-icon>
        </span>
      </template>
    </el-popover>
  </span>
</template>

<script setup lang="ts">
import { Edit, Loading } from '@element-plus/icons-vue';
import type {
  FormInstance,
  FormItemRule,
  InputNumberInstance,
  PopoverInstance,
} from 'element-plus/es';
import { computed, reactive, ref } from 'vue';

defineOptions({ name: 'DoNumberSetter' });

const props = withDefaults(
  defineProps<{
    newValue?: number | string;
    num?: number | string;
    minNum?: number | string;
    changing?: boolean;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    newValue: undefined,
    num: undefined,
    minNum: 1,
    changing: false,
    label: '',
    placeholder: undefined,
    disabled: false,
  },
);

const emit = defineEmits<{ open: []; close: []; ok: [value: number | undefined] }>();
const resolvedPlaceholder = computed(() => props.placeholder ?? `请输入${props.label}`);

const validation: FormItemRule['validator'] = (_rule, value, callback) => {
  if (!value && value !== 0) {
    callback(new Error(resolvedPlaceholder.value));
    return;
  }
  callback();
};

const editing = ref(false);
const popoverRef = ref<PopoverInstance>();
const refForm = ref<FormInstance>();
const inputRef = ref<InputNumberInstance>();
const form = reactive({ newValue: undefined as number | undefined });
const rules = { newValue: [{ validator: validation }] };

const close = () => {
  popoverRef.value?.hide();
};

const confirm = () => {
  refForm.value?.validate((isOk) => {
    if (!isOk || props.changing) return;
    if (form.newValue !== props.num) emit('ok', form.newValue);
    close();
  });
};

const onBeforeEnter = () => {
  editing.value = true;
  refForm.value?.clearValidate();
  form.newValue = props.newValue === undefined ? undefined : Number(props.newValue);
  emit('open');
};

const onAfterEnter = () => {
  inputRef.value?.focus();
};

const onAfterLeave = () => {
  form.newValue = undefined;
  refForm.value?.clearValidate();
  emit('close');
};
</script>

<style lang="scss" scoped>
.do-number-setter {
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;

  .do-number-setter-control {
    box-sizing: border-box;
    margin-left: 4px;
    padding: 4px;
    border-radius: 4px;
    color: var(--ku-color-primary);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.2s;

    &:hover,
    &.is-active {
      background-color: var(--ku-color-primary-bg);
    }

    &.is-changing {
      cursor: default;
    }
  }

  .do-rotate {
    animation: rotating 1.5s linear infinite;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<style lang="scss">
.do-number-setter-popover {
  .do-number-setter-title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--ku-text-primary);
  }

  .do-number-setter-input {
    width: 100%;
  }

  .do-number-setter-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>
