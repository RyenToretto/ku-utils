<!--
  投放时段周网格
  - 合同：336 位半小时位图（7×48）；不限提交仍传 null
  - 固定 658px：周列 80 + 格区 576（12px × 48）；document.mouseup 提交
-->
<template>
  <div class="schedule-time-week-picker">
    <div class="schedule-time-week-picker-inner">
      <div class="schedule-time-week-picker-main">
        <div class="schedule-time-week-picker-hd">
          <div class="schedule-time-week-picker-hd-title">时段</div>
          <div class="schedule-time-week-picker-hd-con">
            <div class="schedule-time-week-picker-hd-ranges">
              <div class="schedule-time-week-picker-range">00:00 - 12:00</div>
              <div class="schedule-time-week-picker-range">12:00 - 24:00</div>
            </div>
            <div class="schedule-time-week-picker-hd-hours">
              <span
                v-for="hour in HOURS"
                :key="hour"
                class="schedule-time-week-picker-hour-label"
              >
                {{ hour }}
              </span>
            </div>
          </div>
        </div>

        <div class="schedule-time-week-picker-bd">
          <div class="schedule-time-week-picker-weeks">
            <div
              v-for="(weekLabel, dayIndex) in WEEK_LABELS"
              :key="dayIndex"
              class="schedule-time-week-picker-week"
            >
              {{ weekLabel }}
            </div>
          </div>
          <div
            class="schedule-time-week-picker-cells"
            @mousedown.prevent="onCellMouseDown"
            @mousemove="onCellMouseMove"
          >
            <el-tooltip
              v-for="cellIndex in CELL_COUNT"
              :key="cellIndex - 1"
              :content="cellTitle(cellIndex - 1)"
              :show-after="800"
              :disabled="isMove"
              placement="top"
              effect="dark"
            >
              <div
                class="schedule-time-week-picker-cell"
                :class="{
                  'is-active': bits[cellIndex - 1] === '1',
                  'is-preview': previewSet.has(cellIndex - 1),
                }"
                :data-index="cellIndex - 1"
              />
            </el-tooltip>
          </div>
        </div>
      </div>

      <div class="schedule-time-week-picker-help">
        <div class="schedule-time-week-picker-help-bar">
          <div class="schedule-time-week-picker-legend">
            <span class="schedule-time-week-picker-swatch" />
            <span class="schedule-time-week-picker-legend-text">未选</span>
            <span class="schedule-time-week-picker-swatch is-active" />
            <span class="schedule-time-week-picker-legend-text">已选</span>
          </div>
          <button
            type="button"
            class="schedule-time-week-picker-clear"
            @click="clearSelection"
          >
            清空
          </button>
        </div>
        <div
          v-if="daySummaries.length"
          class="schedule-time-week-picker-summary"
        >
          <p
            v-for="row in daySummaries"
            :key="row.label"
            class="schedule-time-week-picker-summary-row"
          >
            <span class="schedule-time-week-picker-summary-day">{{ row.label }}：</span>
            <span>{{ row.text }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  EMPTY_SCHEDULE_TIME,
  SCHEDULE_TIME_LENGTH,
  SCHEDULE_TIME_SLOTS_PER_DAY,
  buildScheduleTimeBoundaryLabels,
  formatScheduleTimeDaySummaries,
  normalizeScheduleTimeBitmap,
} from '@/utils/scheduleTime';

defineOptions({ name: 'ScheduleTimeWeekPicker' });

const props = defineProps<{
  modelValue?: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [string];
  change: [string];
}>();

const WEEK_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_COUNT = SCHEDULE_TIME_LENGTH;
const SLOTS_PER_DAY = SCHEDULE_TIME_SLOTS_PER_DAY;
const BOUNDARY_LABELS = buildScheduleTimeBoundaryLabels();

const bits = ref(normalizeScheduleTimeBitmap(props.modelValue));
const isMove = ref(false);
const startIndex = ref(-1);
const axis = ref<{
  startx?: number;
  starty?: number;
  endx?: number;
  endy?: number;
}>({});
const previewIndexes = ref<number[]>([]);

const previewSet = computed(() => new Set(previewIndexes.value));

const daySummaries = computed(() => formatScheduleTimeDaySummaries(bits.value, WEEK_LABELS));

watch(
  () => props.modelValue,
  (value) => {
    const next = normalizeScheduleTimeBitmap(value);
    if (next !== bits.value) bits.value = next;
  },
);

function emitValue(next: string) {
  bits.value = next;
  emit('update:modelValue', next);
  emit('change', next);
}

function cellTitle(index: number) {
  const slot = index % SLOTS_PER_DAY;
  const day = Math.floor(index / SLOTS_PER_DAY);
  const label = WEEK_LABELS[day] || '';
  return `${label} ${BOUNDARY_LABELS[slot]}~${BOUNDARY_LABELS[slot + 1]}`;
}

function parseIndex(raw: string | null | undefined) {
  if (raw == null || raw === '') return null;
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0 || index >= SCHEDULE_TIME_LENGTH) return null;
  return index;
}

function readIndex(event: MouseEvent) {
  const hit = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
  const cell = hit?.closest?.('[data-index]') as HTMLElement | null;
  return parseIndex(cell?.getAttribute('data-index'));
}

function getSelectIndexes() {
  const { startx, starty, endx, endy } = axis.value;
  if (startx == null || starty == null) return [] as number[];
  const ex = endx ?? startx;
  const ey = endy ?? starty;
  const minX = Math.min(startx, ex);
  const maxX = Math.max(startx, ex);
  const minY = Math.min(starty, ey);
  const maxY = Math.max(starty, ey);
  const list: number[] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      list.push(x + y * SLOTS_PER_DAY);
    }
  }
  return list;
}

function applySelectIndexes(indexList: number[]) {
  if (!indexList.length || startIndex.value < 0) return;
  const newData = bits.value[startIndex.value] === '1' ? '0' : '1';
  const chars = bits.value.split('');
  for (const index of indexList) {
    chars[index] = newData;
  }
  emitValue(chars.join(''));
}

function onCellMouseDown(event: MouseEvent) {
  const index = readIndex(event);
  if (index == null) return;
  isMove.value = true;
  startIndex.value = index;
  const x = index % SLOTS_PER_DAY;
  const y = Math.floor(index / SLOTS_PER_DAY);
  axis.value = { startx: x, starty: y, endx: x, endy: y };
  previewIndexes.value = getSelectIndexes();
}

function onCellMouseMove(event: MouseEvent) {
  if (!isMove.value) return;
  const index = readIndex(event);
  if (index == null) return;
  axis.value = {
    ...axis.value,
    endx: index % SLOTS_PER_DAY,
    endy: Math.floor(index / SLOTS_PER_DAY),
  };
  previewIndexes.value = getSelectIndexes();
}

function resetMousemove(event?: MouseEvent) {
  if (!isMove.value) return;
  if (event) onCellMouseMove(event);
  const indexes = previewIndexes.value.length ? previewIndexes.value : getSelectIndexes();
  applySelectIndexes(indexes);
  isMove.value = false;
  startIndex.value = -1;
  axis.value = {};
  previewIndexes.value = [];
}

function clearSelection() {
  emitValue(EMPTY_SCHEDULE_TIME);
}

function onDocMouseUp(event: MouseEvent) {
  resetMousemove(event);
}

onMounted(() => {
  document.addEventListener('mouseup', onDocMouseUp);
});

onBeforeUnmount(() => {
  document.removeEventListener('mouseup', onDocMouseUp);
});

defineExpose({
  resetEmpty() {
    clearSelection();
  },
});
</script>

<style lang="scss" scoped>
.schedule-time-week-picker {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
  user-select: none;
  font-size: 14px;
  line-height: 32px;
  color: var(--ku-text-primary, var(--el-text-color-primary));
}

.schedule-time-week-picker-inner {
  width: 658px;
  max-width: 658px;
}

.schedule-time-week-picker-main {
  border: 1px solid var(--el-border-color);
  background: var(--ku-bg-card, var(--el-bg-color));
  position: relative;
}

.schedule-time-week-picker-hd {
  display: flex;
  background: var(--el-fill-color-light);
}

.schedule-time-week-picker-hd-title {
  box-sizing: border-box;
  width: 80px;
  height: 65px;
  flex-shrink: 0;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--ku-text-primary, var(--el-text-color-primary));
}

.schedule-time-week-picker-hd-con {
  width: 576px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.schedule-time-week-picker-hd-ranges {
  display: flex;
  border-bottom: 1px solid var(--el-border-color);
}

.schedule-time-week-picker-range {
  box-sizing: border-box;
  width: 288px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-left: 1px solid var(--el-border-color);
}

.schedule-time-week-picker-hd-hours {
  display: flex;
}

.schedule-time-week-picker-hour-label {
  box-sizing: border-box;
  width: 24px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-left: 1px solid var(--el-border-color);
}

.schedule-time-week-picker-bd {
  display: flex;
}

.schedule-time-week-picker-weeks {
  width: 80px;
  flex-shrink: 0;
}

.schedule-time-week-picker-week {
  box-sizing: border-box;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-top: 1px solid var(--el-border-color);
}

.schedule-time-week-picker-cells {
  box-sizing: border-box;
  width: 576px;
  height: 210px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  position: relative;
}

.schedule-time-week-picker-cell {
  box-sizing: border-box;
  width: 12px;
  height: 30px;
  flex-shrink: 0;
  border-left: 1px solid var(--el-border-color-extra-light);
  border-top: 1px solid var(--el-border-color-extra-light);
  background: var(--el-fill-color-blank);
  cursor: pointer;
  position: relative;
  outline: none;
}

.schedule-time-week-picker-cell.is-active {
  background: var(--el-color-primary);
}

.schedule-time-week-picker-cell.is-preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--el-color-primary) 40%, #113860);
  opacity: 0.5;
  pointer-events: none;
  z-index: 1;
}

.schedule-time-week-picker-help {
  box-sizing: border-box;
  width: 658px;
  border: 1px solid var(--el-border-color);
  border-top: none;
  padding: 5px 15px;
  background: var(--ku-bg-card, var(--el-bg-color));
}

.schedule-time-week-picker-help-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
}

.schedule-time-week-picker-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.schedule-time-week-picker-swatch {
  width: 14px;
  height: 20px;
  margin-right: 6px;
  border: 1px solid var(--el-border-color);
  background: var(--el-fill-color-blank);
  display: inline-block;
}

.schedule-time-week-picker-swatch.is-active {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.schedule-time-week-picker-legend-text {
  margin-right: 15px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.schedule-time-week-picker-clear {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 14px;
  color: var(--el-color-primary);
  cursor: pointer;
  line-height: 1.4;

  &:hover {
    opacity: 0.85;
  }
}

.schedule-time-week-picker-summary {
  margin-top: 2px;
}

.schedule-time-week-picker-summary-row {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ku-text-primary, var(--el-text-color-primary));
}

.schedule-time-week-picker-summary-day {
  color: var(--ku-text-tertiary, #999);
}

.schedule-time-week-picker-cells :deep(.el-tooltip__trigger) {
  display: block;
  width: 12px;
  height: 30px;
  flex-shrink: 0;
  line-height: 0;
}
</style>
