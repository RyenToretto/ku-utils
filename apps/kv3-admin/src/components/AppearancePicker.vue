<template>
  <div class="appearance-options">
    <button
      v-for="opt in THEME_OPTIONS"
      :key="opt.value"
      type="button"
      class="appearance-option"
      :class="{ 'is-active': modelValue === opt.value }"
      @click="$emit('update:modelValue', opt.value)"
    >
      <span>{{ resolvedLabels[opt.value] }}</span>
      <el-icon v-if="modelValue === opt.value">
        <Check />
      </el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue';
import { computed } from 'vue';

import { THEME_OPTIONS, type ThemeMode } from '@/utils/theme';

const props = defineProps<{
  modelValue: ThemeMode;
  labelOverrides?: Partial<Record<ThemeMode, string>>;
}>();

defineEmits<{
  'update:modelValue': [value: ThemeMode];
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
