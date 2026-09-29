<template>
  <div class="page-ui-kit-schedule-week">
    <PageHeader subtitle="336 位半小时位图（7×48）；拖拽选择，mouseup 提交。" />

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>投放时段周网格</h3>
      <ScheduleTimeWeekPicker v-model="bitmap" />
      <div class="ui-kit-demo-actions">
        <el-button @click="clearBitmap">清空</el-button>
        <el-button
          type="primary"
          @click="fillWeekdaysMorning"
        >
          工作日上午预设
        </el-button>
      </div>
      <p class="ui-kit-demo-hint">位图长度：{{ bitmap.length }}</p>
      <p class="ui-kit-demo-hint ui-kit-demo-mono">{{ bitmapPreview }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import ScheduleTimeWeekPicker from '@/components/ScheduleTimeWeekPicker.vue';
import {
  EMPTY_SCHEDULE_TIME,
  SCHEDULE_TIME_LENGTH,
  SCHEDULE_TIME_SLOTS_PER_DAY,
  normalizeScheduleTimeBitmap,
} from '@/utils/scheduleTime';

const bitmap = ref(EMPTY_SCHEDULE_TIME);

const bitmapPreview = computed(() => {
  const bits = normalizeScheduleTimeBitmap(bitmap.value);
  const ones = bits.split('').filter((c) => c === '1').length;
  return `${ones} / ${SCHEDULE_TIME_LENGTH}`;
});

function clearBitmap() {
  bitmap.value = EMPTY_SCHEDULE_TIME;
}

/** Demo：周一至周五 09:00–12:00 */
function fillWeekdaysMorning() {
  const chars = EMPTY_SCHEDULE_TIME.split('');
  for (let day = 0; day < 5; day += 1) {
    const dayStart = day * SCHEDULE_TIME_SLOTS_PER_DAY;
    for (let slot = 18; slot < 24; slot += 1) {
      chars[dayStart + slot] = '1';
    }
  }
  bitmap.value = chars.join('');
}
</script>

<style lang="scss" scoped>
.page-ui-kit-schedule-week {
  box-sizing: border-box;
}

.ui-kit-demo-card {
  margin-top: 12px;

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
  }
}

.ui-kit-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.ui-kit-demo-hint {
  margin: 8px 0 0;
  color: var(--ku-text-secondary, var(--el-text-color-secondary));
  font-size: 12px;
}

.ui-kit-demo-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-all;
}
</style>
