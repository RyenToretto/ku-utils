<template>
  <div class="appearance-options">
    <button
      v-for="opt in THEME_OPTIONS"
      :key="opt.value"
      type="button"
      class="appearance-option"
      :class="{ 'is-active': value === opt.value }"
      @click="$emit('input', opt.value)"
    >
      <span>{{ resolvedLabels[opt.value] }}</span>
      <el-icon v-if="value === opt.value">
        <Check />
      </el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Check } from '@/components/icons/elIcons';
import { THEME_OPTIONS, type ThemeMode } from '@/utils/theme';

/**
 * Vue2.7：跨文件 ThemeMode alias 会编成 type:null；props 处内联字面量联合。
 * Vue2 自定义组件 v-model = value + input（非 Vue3 modelValue）
 */
const props = withDefaults(
  defineProps<{
    value: 'light' | 'dark' | 'system';
    labelOverrides?: Partial<Record<'light' | 'dark' | 'system', string>>;
  }>(),
  {
    labelOverrides: undefined,
  },
);

defineEmits<{
  input: [value: ThemeMode];
}>();

const defaultThemeLabels: Record<ThemeMode, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
};

const resolvedLabels = computed(() => ({
  ...defaultThemeLabels,
  ...props.labelOverrides,
}));
</script>
