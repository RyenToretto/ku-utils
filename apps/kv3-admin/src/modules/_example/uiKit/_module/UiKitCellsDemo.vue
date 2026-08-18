<template>
  <div class="page-ui-kit-cells">
    <PageHeader
      subtitle="CellState 只读 / 开关、CellDateTime 多种布局、DateRange、DoSelector、DoNumberSetter、DoTxtSetter。"
    />

    <el-card
      shadow="never"
      class="demo-card"
    >
      <template #header>CellState</template>
      <div class="demo-row">
        <CellState :model-value="1" />
        <CellState :model-value="0" />
        <CellState
          :model-value="switchValue"
          switchable
          :switching="switching"
          @switch="onSwitch"
        />
      </div>
    </el-card>

    <el-card
      shadow="never"
      class="demo-card"
    >
      <template #header>CellDateTime</template>
      <div class="demo-row demo-datetime">
        <div>
          <div class="demo-label">stacked</div>
          <CellDateTime :value="sampleTime" />
        </div>
        <div>
          <div class="demo-label">compact</div>
          <CellDateTime
            layout="compact"
            :value="sampleTime"
          />
        </div>
        <div>
          <div class="demo-label">with-actor</div>
          <CellDateTime
            layout="with-actor"
            :value="sampleTime"
            actor="zhengwenwen"
          />
        </div>
        <div>
          <div class="demo-label">dateOnly</div>
          <CellDateTime
            date-only
            :value="sampleTime"
          />
        </div>
        <div>
          <div class="demo-label">inline</div>
          <CellDateTime
            variant="inline"
            :value="sampleTime"
          />
        </div>
      </div>
    </el-card>

    <el-card
      shadow="never"
      class="demo-card"
    >
      <template #header>DateRange / DoSelector</template>
      <div class="demo-row">
        <DateRange
          v-model="dateRange"
          style="width: 260px"
        />
        <DoSelector
          v-model="selectorValue"
          style="width: 180px"
          :options="cityOptions"
        >
          <template #option="{ option }">
            <el-option
              :label="String(option.label)"
              :value="toOptionValue(option.value)"
            />
          </template>
        </DoSelector>
        <span class="demo-hint">
          已选：{{ selectorValue || '—' }} / {{ dateRange.join(' ~ ') || '—' }}
        </span>
      </div>
    </el-card>

    <el-card
      shadow="never"
      class="demo-card"
    >
      <template #header>DoNumberSetter / DoTxtSetter</template>
      <div class="demo-row">
        <DoNumberSetter
          :num="score"
          :new-value="score"
          @ok="onScoreOk"
        >
          评分 {{ score }}
        </DoNumberSetter>
        <DoTxtSetter
          inline
          :init-value="title"
          @ok="onTitleOk"
        >
          <span>{{ title }}</span>
        </DoTxtSetter>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

const sampleTime = '2026-08-06 19:43:02';
const switchValue = ref(1);
const switching = ref(false);
const dateRange = ref<string[]>([]);
const selectorValue = ref('');
const score = ref(88);
const title = ref('可编辑标题');

const cityOptions = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '深圳', value: 'sz' },
];

function toOptionValue(value: unknown): string | number | boolean {
  return value as string | number | boolean;
}

function onSwitch(value: string | number | boolean) {
  switching.value = true;
  window.setTimeout(() => {
    switchValue.value = Number(value);
    switching.value = false;
    ElMessage.success('状态已切换');
  }, 400);
}

function onScoreOk(value: number | undefined) {
  if (value == null) return;
  score.value = value;
  ElMessage.success(`评分更新为 ${value}`);
}

function onTitleOk(value: string | undefined) {
  title.value = value || title.value;
  ElMessage.success('标题已更新');
}
</script>

<style lang="scss" scoped>
.demo-card {
  margin-bottom: 12px;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.demo-datetime {
  align-items: flex-start;
}

.demo-label {
  margin-bottom: 6px;
  font-size: 12px;
  color: #909399;
}

.demo-hint {
  font-size: 13px;
  color: #606266;
}
</style>
