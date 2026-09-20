<template>
  <SimpleExampleList
    :page-title="pageTitle"
    :page-description="pageDesc"
    :filter-button-count="scenario.buttonCount"
    :filter-field-count="scenario.filterCount"
    :filter-line="scenario.line"
    :fill-viewport-layout="scenario.fillViewportLayout"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import SimpleExampleList from '../../simpleExample/_module/simpleExample/SimpleExampleList.vue';
import type { DoFilterPanelDemoScenario } from '../_utils/doFilterPanelDemo';

defineOptions({ name: 'DoFilterPanelScenarioDemo' });

const DEFAULT_SCENARIO: DoFilterPanelDemoScenario = {
  buttonCount: 2,
  filterCount: 6,
  line: 2,
  fillViewportLayout: false,
};

const route = useRoute();

const scenario = computed<DoFilterPanelDemoScenario>(() => {
  const raw = route.meta.doFilterPanel as DoFilterPanelDemoScenario | undefined;
  if (!raw) return DEFAULT_SCENARIO;
  return {
    buttonCount: raw.buttonCount,
    filterCount: raw.filterCount,
    line: raw.line,
    fillViewportLayout: !!raw.fillViewportLayout,
  };
});

const pageTitle = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : '筛选面板',
);
const pageDesc = computed(() => (typeof route.meta.desc === 'string' ? route.meta.desc : ''));
</script>
