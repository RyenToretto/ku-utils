<template>
  <div class="page-example-school-selector-demo">
    <section class="page-example-school-selector-demo-card">
      <h3 class="page-example-school-selector-demo-section">筛选区（单选 / 多选）</h3>
      <DoFilterPanel
        :line="1"
        @search="handleFilterSearch"
      >
        <el-form
          class="with-btn"
          inline
          label-width="120px"
          @submit.prevent
        >
          <el-form-item label="学校（单选）">
            <SchoolSelector
              v-model="listFilters.schoolSingle"
              placeholder="请选择学校"
            />
          </el-form-item>
          <el-form-item label="学校（多选）">
            <SchoolSelector
              v-model="listFilters.schoolMulti"
              multiple
              placeholder="请选择学校（可多选）"
              :default-page-size="5"
            />
          </el-form-item>
        </el-form>
        <template #ctl>
          <el-button @click="handleFilterReset">重置</el-button>
        </template>
      </DoFilterPanel>
      <p class="page-example-school-selector-demo-meta">
        当前值：单选={{ listFilters.schoolSingle?.label || '—' }}；多选={{
          formatMultiLabels(listFilters.schoolMulti) || '—'
        }}
      </p>
      <p
        v-if="lastFilterSnapshot"
        class="page-example-school-selector-demo-meta"
      >
        上次查询快照：{{ lastFilterSnapshot }}
      </p>
    </section>

    <section class="page-example-school-selector-demo-card">
      <h3 class="page-example-school-selector-demo-section">弹层表单回填</h3>
      <div class="page-example-school-selector-demo-actions">
        <el-button
          type="primary"
          @click="openCreateDemo"
        >
          新建演示
        </el-button>
        <el-button @click="openEditDemo">编辑演示</el-button>
      </div>
      <p
        v-if="lastDialogSnapshot"
        class="page-example-school-selector-demo-meta"
      >
        上次弹层提交：{{ lastDialogSnapshot }}
      </p>
    </section>

    <DialogEditSchoolSelectorDemo
      ref="dialogEditDemoRef"
      @success="onDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

import DialogEditSchoolSelectorDemo from './_module/DialogEditSchoolSelectorDemo.vue';

import SchoolSelector from '@/modules/_example/schoolResource/_module/SchoolSelector.vue';
import type { SchoolSelectorValue } from '@/modules/_example/schoolResource/_module/types';

const listFilters = reactive<{
  schoolSingle: SchoolSelectorValue | null;
  schoolMulti: SchoolSelectorValue[];
}>({
  schoolSingle: null,
  schoolMulti: [],
});

const lastFilterSnapshot = ref('');
const lastDialogSnapshot = ref('');
const dialogEditDemoRef = ref<InstanceType<typeof DialogEditSchoolSelectorDemo>>();

function formatMultiLabels(list: SchoolSelectorValue[]) {
  if (!list.length) return '';
  return list.map((item) => item.label).join('、');
}

function handleFilterSearch() {
  lastFilterSnapshot.value = JSON.stringify({
    single: listFilters.schoolSingle?.id ?? null,
    multi: listFilters.schoolMulti.map((item) => item.id),
  });
}

function handleFilterReset() {
  listFilters.schoolSingle = null;
  listFilters.schoolMulti = [];
  lastFilterSnapshot.value = '';
}

function openCreateDemo() {
  dialogEditDemoRef.value?.open();
}

function openEditDemo() {
  dialogEditDemoRef.value?.open({
    id: 'demo-1',
    demoName: '演示班级计划',
    schoolSingle: listFilters.schoolSingle,
    schoolMulti: [...listFilters.schoolMulti],
  });
}

function onDialogSuccess(payload: {
  id: string;
  demoName: string;
  schoolSingle: SchoolSelectorValue | null;
  schoolMulti: SchoolSelectorValue[];
}) {
  lastDialogSnapshot.value = `${payload.demoName}｜单选=${payload.schoolSingle?.label || '—'}｜多选=${
    formatMultiLabels(payload.schoolMulti) || '—'
  }`;
}
</script>

<style lang="scss" scoped>
.page-example-school-selector-demo {
  box-sizing: border-box;
}

.page-example-school-selector-demo-card {
  margin-top: 12px;
  padding: 16px;
  background: var(--ku-bg-elevated, #fff);
  border-radius: 8px;
}

.page-example-school-selector-demo-section {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
}

.page-example-school-selector-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page-example-school-selector-demo-meta {
  margin: 8px 0 0;
  color: var(--ku-text-secondary, #909399);
  font-size: 13px;
  word-break: break-all;
}
</style>
