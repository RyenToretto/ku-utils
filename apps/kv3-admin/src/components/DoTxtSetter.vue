<template>
  <div
    class="do-txt-setter"
    :class="{ inline }"
  >
    <el-popover
      v-if="!disabled"
      ref="popoverRef"
      trigger="click"
      :width="280"
      :placement="placement"
      :disabled="noOpen || changing"
      popper-class="popper-txt-setter"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <template #reference>
        <div
          class="txt-set-btn"
          :class="{ changing }"
        >
          <el-icon
            v-if="changing"
            class="do-rotate"
          >
            <Loading />
          </el-icon>
          <slot v-else />
        </div>
      </template>

      <div class="do-txtsetter-popover">
        <el-form
          ref="refForm"
          :model="form"
          :rules="rules"
          @submit.prevent
        >
          <el-form-item prop="newValue">
            <el-input
              ref="inputRef"
              v-model="form.newValue"
              type="text"
              clearable
              autocomplete="off"
              :placeholder="resolvedPlaceholder"
              @keydown.enter.prevent="confirm"
            />
          </el-form-item>
        </el-form>
        <div class="do-txtsetter-footer">
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
    </el-popover>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import type {
  FormInstance,
  FormItemRule,
  InputInstance,
  Placement,
  PopoverInstance,
} from 'element-plus/es';
import { computed, reactive, ref } from 'vue';

defineOptions({ name: 'DoTxtSetter' });

const props = withDefaults(
  defineProps<{
    initValue?: string | number;
    required?: boolean;
    placement?: Placement;
    noOpen?: boolean;
    changing?: boolean;
    placeholder?: string;
    errorHolder?: string;
    num?: boolean;
    inline?: boolean;
    disabled?: boolean;
    min?: number;
    max?: number;
  }>(),
  {
    initValue: '',
    required: true,
    placement: 'bottom-start',
    noOpen: false,
    changing: false,
    placeholder: undefined,
    errorHolder: undefined,
    num: false,
    inline: false,
    disabled: false,
    min: undefined,
    max: undefined,
  },
);

const emit = defineEmits<{ close: []; open: []; ok: [value: string | undefined] }>();

const resolvedPlaceholder = computed(() => props.placeholder ?? '请输入');
const resolvedErrorHolder = computed(() => props.errorHolder ?? '请输入整数');

const validation: FormItemRule['validator'] = (_rule, value, callback) => {
  const strVal = String(value ?? '');
  const badNum = !Number.isInteger(+strVal);
  const badMin = !badNum && props.min !== undefined ? +strVal < props.min : false;
  const badMax = !badNum && props.max !== undefined ? +strVal > props.max : false;
  if (strVal && props.num && (badNum || badMin || badMax)) {
    callback(new Error(resolvedErrorHolder.value));
    return;
  }
  if (props.required && !strVal) {
    callback(new Error(resolvedPlaceholder.value));
    return;
  }
  callback();
};

const popoverRef = ref<PopoverInstance>();
const refForm = ref<FormInstance>();
const inputRef = ref<InputInstance>();
const form = reactive({ newValue: '' as string | undefined });
const rules = { newValue: [{ validator: validation }] };

const close = () => {
  popoverRef.value?.hide();
};

const confirm = () => {
  refForm.value?.validate((isOk) => {
    if (!isOk || props.changing) return;
    if (form.newValue !== `${props.initValue}`) emit('ok', form.newValue);
    close();
  });
};

const onBeforeEnter = () => {
  refForm.value?.clearValidate();
  form.newValue = `${props.initValue}`;
  emit('open');
};

const onAfterEnter = () => {
  inputRef.value?.focus();
};

const onAfterLeave = () => {
  form.newValue = '';
  refForm.value?.clearValidate();
  emit('close');
};
</script>

<style lang="scss" scoped>
.do-txt-setter {
  &.inline {
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;

    .txt-set-btn {
      display: inline-flex;
      justify-content: flex-start;
    }
  }
}

:deep(.txt-set-btn) {
  box-sizing: border-box;
  font-size: 12px;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;

  .do-rotate {
    animation: rotating 1.5s linear infinite;
    margin-left: 2px;
    color: var(--ku-text-placeholder);
    font-size: 16px;
  }

  > span {
    box-sizing: border-box;
    padding: 5px;
    border-radius: 2px;
    color: var(--ku-text-placeholder);
    display: flex;
    justify-content: center;
    align-items: center;
    transition:
      color 0.3s linear,
      background-color 0.3s linear;
  }

  &.changing,
  &:hover {
    > span {
      color: var(--ku-text-primary);
      background-color: var(--ku-bg-hover);
    }
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
.editable-txt-cell .cell {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .do-txt-setter.inline > .txt-set-btn {
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    justify-content: flex-start;
  }

  .line-txt {
    flex: 1;
    display: inline;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.do-txtsetter-popover {
  .do-txtsetter-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>
