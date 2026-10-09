<template>
  <SimpleExampleList
    :filter-button-count="scenario.buttonCount"
    :filter-field-count="scenario.filterCount"
    :filter-line="scenario.line"
    :fill-viewport-layout="scenario.fillViewportLayout"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router/composables';

import SimpleExampleList from '../../simpleExample/_module/simpleExample/SimpleExampleList.vue';
import type { DoFilterPanelDemoScenario } from '../_utils/doFilterPanelDemo';

const DEFAULT_SCENARIO: DoFilterPanelDemoScenario = {
  buttonCount: 2,
  filterCount: 6,
  line: 2,
  fillViewportLayout: false,
};

const route = useRoute();

const scenario = computed<DoFilterPanelDemoScenario>(() => {
  const raw = route.meta?.doFilterPanel as DoFilterPanelDemoScenario | undefined;
  if (!raw) return DEFAULT_SCENARIO;
  return {
    buttonCount: raw.buttonCount,
    filterCount: raw.filterCount,
    line: raw.line,
    fillViewportLayout: !!raw.fillViewportLayout,
  };
});
</script>
