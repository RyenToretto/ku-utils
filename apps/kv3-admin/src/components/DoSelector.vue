<template>
  <el-select
    v-bind="$attrs"
    ref="refDoSelector"
    v-model="selectorValue"
    class="do-selector"
    :disabled="selectorDisabled"
    popper-class="custom_dropdown_popper"
    :placeholder="selectorPlaceholder"
    default-first-option
    @visible-change="handleVisibleChange"
  >
    <el-option
      v-if="requesting || loading"
      value=""
      disabled
    >
      <span class="do-selector-loading">加载中...</span>
    </el-option>

    <template v-else>
      <slot :options="optionArr" />

      <el-option-group
        v-if="!hideSlotOption"
        label=""
      >
        <template
          v-for="(eachOne, indexOption) in optionArr"
          :key="indexOption"
        >
          <slot
            name="option"
            :option="eachOne"
            :index="indexOption"
          />
        </template>
      </el-option-group>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';

interface DoSelectorPayload {
  requestFunc: (payload: DoSelectorPayload) => Promise<unknown[]>;
  [key: string]: unknown;
}

interface OptionItem {
  type?: string;
  [key: string]: unknown;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | unknown[];
    type?: string;
    loading?: boolean;
    syncToStore?: boolean;
    inDialog?: boolean;
    sKey?: string;
    valueKey?: string;
    payload?: DoSelectorPayload;
    options?: OptionItem[];
    hideSlotOption?: boolean;
  }>(),
  {
    modelValue: '',
    type: '',
    loading: false,
    syncToStore: false,
    inDialog: false,
    sKey: '',
    valueKey: '',
    payload: () => ({}) as DoSelectorPayload,
    options: () => [],
    hideSlotOption: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: unknown];
  change: [value: unknown];
  'select-change': [item: OptionItem | undefined];
}>();
const attrs = useAttrs();
const requesting = ref(false);
const cacheQueryString = ref('-1');
const allOption = ref<OptionItem[]>([]);
const insideAllOption = ref<OptionItem[]>([]);

const isStaticData = computed(() => props.options && props.options.length);
const selectorDisabled = computed(() => Boolean(attrs.disabled) || props.loading);
const selectorPlaceholder = computed(() =>
  typeof attrs.placeholder === 'string' ? attrs.placeholder : '请选择',
);
const selectorValue = computed({
  get: () => props.modelValue,
  set: (value: unknown) => doEmit(value),
});

const optionArr = computed(() => {
  if (isStaticData.value) return props.options;
  const arr =
    props.inDialog && insideAllOption.value.length ? insideAllOption.value : allOption.value;
  return props.type ? arr.filter((v) => v.type === props.type) : arr;
});

const getQueryString = () => JSON.stringify(props.payload);

const handleVisibleChange = (visible: boolean) => {
  if (isStaticData.value) return;
  if (visible && getQueryString() !== cacheQueryString.value) {
    toGetOptionList();
  }
};

const toGetOptionList = () => {
  if (isStaticData.value || !props.payload?.requestFunc) return;
  requesting.value = true;
  cacheQueryString.value = getQueryString();
  props.payload
    .requestFunc(props.payload)
    .then((res) => {
      if (props.inDialog) {
        insideAllOption.value = (res || []) as OptionItem[];
      } else {
        allOption.value = (res || []) as OptionItem[];
      }
    })
    .catch(() => {
      cacheQueryString.value = '-1';
    })
    .finally(() => {
      requesting.value = false;
    });
};

const doEmit = (value: unknown) => {
  emit('update:modelValue', value);
  emit('change', value);
  if (props.valueKey) {
    emit(
      'select-change',
      allOption.value.find((item) => item[props.valueKey] === value),
    );
  }
  if (!props.inDialog && props.syncToStore && props.sKey) {
    localStorage.setItem(props.sKey, String(value));
  }
};

const refDoSelector = ref<{ toggleMenu: () => void } | null>(null);
const toggleMenu = () => refDoSelector.value?.toggleMenu();

defineExpose({ toggleMenu });
</script>

<style lang="scss" scoped>
.do-selector {
  box-sizing: border-box;
}

.do-selector-loading {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
