<template>
  <div class="home">
    <p>
      Pinia count: {{ counter.count }}
      <button
        type="button"
        @click="counter.increment()"
      >
        +1
      </button>
    </p>
    <nav class="pg-nav">
      <a href="#ui">ui / skin</a>
      <a href="#hooks">hooks</a>
      <a href="#utils">utils / constants / types</a>
      <a href="#directives">directives</a>
      <a href="#i18n">i18n</a>
      <a href="#custom-columns">custom-columns</a>
      <a href="#toolchain">工程配置</a>
    </nav>

    <UiDemo />
    <HooksDemo />
    <UtilsTypesDemo />
    <DirectivesDemo />
    <I18nDemo />
    <CustomColumnsDemo />
    <ToolchainDemo />
  </div>
</template>

<script setup lang="ts">
import CustomColumnsDemo from '@/demos/CustomColumnsDemo.vue';
import DirectivesDemo from '@/demos/DirectivesDemo.vue';
import HooksDemo from '@/demos/HooksDemo.vue';
import I18nDemo from '@/demos/I18nDemo.vue';
import ToolchainDemo from '@/demos/ToolchainDemo.vue';
import UiDemo from '@/demos/UiDemo.vue';
import UtilsTypesDemo from '@/demos/UtilsTypesDemo.vue';
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>
