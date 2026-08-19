<template>
  <section
    id="toolchain"
    class="pg-section"
  >
    <h3>工程配置包</h3>
    <p class="pg-hint">无 UI，已在本 playground 实际接入：</p>
    <ul class="pg-list">
      <li>
        <code class="pg-code">@ku-utils/eslint-config</code>
        →
        <code class="pg-code">eslint.config.js</code>
      </li>
      <li>
        <code class="pg-code">@ku-utils/prettier-config</code>
        → 根
        <code class="pg-code">package.json#prettier</code>
      </li>
      <li>
        <code class="pg-code">@ku-utils/tsconfig</code>
        →
        <code class="pg-code">tsconfig.json extends vue3.json</code>
      </li>
      <li>
        <code class="pg-code">@ku-utils/stylelint-config</code>
        →
        <code class="pg-code">stylelint.config.js</code>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'ToolchainDemo' });
</script>

<style>
.pg-list {
  margin: 0;
  padding-left: 1.2rem;
  line-height: 1.8;
}
</style>
