<template>
  <span class="do-number-setter">
    <span class="do-number-setter-label">
      <slot />
    </span>

    <el-popover
      v-if="!disabled"
      v-model:visible="popoverShow"
      width="auto"
      trigger="click"
      placement="right-end"
      @hide="resetForm"
    >
      <div class="do-number-setter-popover">
        <el-form
          ref="refForm"
          class="do-number-setter-form"
          :model="form"
          :rules="rules"
          @submit.prevent
        >
          <el-form-item
            :label="label"
            prop="newValue"
          >
            <el-input-number
              v-model="form.newValue"
              :min="+minNum"
              :max="Number.MAX_SAFE_INTEGER"
              placeholder=""
            />
          </el-form-item>
        </el-form>

        <div class="do-number-setter-footer">
          <div class="do-number-setter-btn-box">
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

      <template #reference>
        <div
          v-if="$slots.reference"
          @click="showPopover"
        >
          <slot name="reference" />
        </div>

        <span
          v-else
          class="do-number-setter-control"
        >
          <el-icon
            v-if="changing"
            class="do-rotate"
          >
            <Loading />
          </el-icon>
          <el-icon
            v-else
            @click="showPopover"
          >
            <Edit />
          </el-icon>
        </span>
      </template>
    </el-popover>
  </span>
</template>

<script setup lang="ts">
import { Edit, Loading } from '@element-plus/icons-vue';
import type { FormInstance, FormItemRule } from 'element-plus/es';
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
const resolvedPlaceholder = computed(() => props.placeholder ?? '请输入');

const validation: FormItemRule['validator'] = (_rule, value, callback) => {
  if (!value && value !== 0) {
    callback(new Error(resolvedPlaceholder.value));
    return;
  }
  callback();
};

const popoverShow = ref(false);
const refForm = ref<FormInstance | null>(null);
const form = reactive({ newValue: undefined as number | undefined });
const rules = { newValue: [{ validator: validation }] };

const confirm = () => {
  refForm.value?.validate((isOk) => {
    if (isOk) {
      if (props.changing) return;
      if (form.newValue !== props.num) emit('ok', form.newValue);
      popoverShow.value = false;
    }
  });
};

const showPopover = () => {
  if (props.changing) {
    popoverShow.value = false;
    return;
  }
  try {
    refForm.value?.clearValidate();
  } catch {
    /* noop */
  }
  form.newValue = props.newValue as number | undefined;
  popoverShow.value = true;
  emit('open');
};

const close = () => {
  popoverShow.value = false;
};

const resetForm = () => {
  form.newValue = undefined;
  refForm.value?.resetFields();
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
    margin-left: 5px;
    padding: 0 5px;
    color: var(--primary-color);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
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
  padding: 6px 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .do-number-setter-form > .el-form-item:first-child {
    margin-bottom: 0;
  }

  .el-form-item__content > .el-form-item__error {
    position: absolute;
  }

  .do-number-setter-footer {
    box-sizing: border-box;
    padding-left: 10px;

    .do-number-setter-btn-box {
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
  }
}
</style>
