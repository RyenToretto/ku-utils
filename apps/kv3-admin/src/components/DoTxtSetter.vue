<template>
  <div
    class="do-txt-setter"
    :class="{ inline }"
  >
    <el-popover
      v-if="!isDisabled"
      v-model:visible="popoverShow"
      width="400"
      :placement="popoverPlacement"
      popper-class="popper-txt-setter"
      @hide="resetForm"
    >
      <template #reference>
        <div
          class="txt-set-btn"
          :class="{ changing }"
          @click="showPopover"
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

      <template #default>
        <div class="do-txtsetter-popover">
          <el-form
            ref="refForm"
            class="do-txtsetter-form"
            :model="form"
            :rules="rules"
            @submit.prevent
          >
            <el-form-item prop="newValue">
              <el-input
                v-model="form.newValue"
                type="text"
                clearable
                autocomplete="off"
              />
            </el-form-item>
          </el-form>

          <div class="do-txtsetter-footer">
            <div class="do-txtsetter-btn-box">
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
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import type { FormInstance, FormItemRule, Placement } from 'element-plus/es';
import { computed, nextTick, reactive, ref } from 'vue';

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
    placement: 'right-end',
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

const isDisabled = computed(() => props.disabled);
const popoverPlacement = computed(() => props.placement);
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
  if (props.required && !strVal && strVal !== '0') {
    callback(new Error(resolvedPlaceholder.value));
    return;
  }
  callback();
};

const popoverShow = ref(false);
const refForm = ref<FormInstance | null>(null);
const form = reactive({ newValue: '' as string | undefined });
const rules = { newValue: [{ validator: validation }] };

const confirm = () => {
  refForm.value?.validate((isOk) => {
    if (isOk) {
      if (props.changing) return;
      const originValue = props.initValue !== undefined ? `${props.initValue}` : undefined;
      if (form.newValue !== originValue) emit('ok', form.newValue);
      popoverShow.value = false;
    }
  });
};

const showPopover = () => {
  if (props.noOpen || props.changing) {
    popoverShow.value = false;
    return;
  }
  try {
    refForm.value?.clearValidate();
  } catch {
    /* noop */
  }
  form.newValue = props.initValue !== undefined ? `${props.initValue}` : '';
  popoverShow.value = true;
  emit('open');
};

const close = () => {
  popoverShow.value = false;
};

const resetForm = () => {
  form.newValue = '';
  nextTick(() => {
    try {
      refForm.value?.clearValidate();
    } catch {
      /* noop */
    }
    emit('close');
  });
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
    color: #918364;
    font-size: 16px;
  }

  > span {
    box-sizing: border-box;
    padding: 5px;
    border-radius: 2px;
    color: #918364;
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
      color: #422e0d;
      background-color: #eef5fe;
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

div.el-popper.popper-txt-setter {
  box-sizing: border-box;
}

.do-txtsetter-popover {
  box-sizing: border-box;
  padding: 5px 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .do-txtsetter-form {
    flex: 1;

    > .el-form-item:first-child {
      margin-bottom: 0;
    }

    .el-form-item__content > .el-form-item__error {
      position: absolute;
    }
  }

  .do-txtsetter-footer {
    box-sizing: border-box;
    padding-left: 5px;

    .do-txtsetter-btn-box {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
}
</style>
