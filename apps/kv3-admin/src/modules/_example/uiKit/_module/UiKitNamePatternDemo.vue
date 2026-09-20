<template>
  <div class="page-ui-kit-name-pattern">
    <PageHeader subtitle="点选通配符插入光标处；底栏芯片 / 浮层 / textarea / useOnly。" />

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>底栏芯片（默认）</h3>
      <DoNamePattern
        v-model="patternBottom"
        :pattern-list="patternList"
      />
      <p class="ui-kit-demo-hint">{{ patternBottom || '—' }}</p>
    </el-card>

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>浮层插入</h3>
      <DoNamePattern
        v-model="patternPopover"
        use-popover
        :pattern-list="patternList"
        style="max-width: 420px"
      />
      <p class="ui-kit-demo-hint">{{ patternPopover || '—' }}</p>
    </el-card>

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>textarea + useOnly</h3>
      <DoNamePattern
        v-model="patternTextarea"
        textarea
        use-only
        :pattern-list="patternList"
      />
      <p class="ui-kit-demo-hint">{{ patternTextarea || '—' }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const patternList = ['{应用名}', '{日期}', '{时分秒}', '{动态标号}'];
const patternBottom = ref('{应用名}-{日期}-{动态标号}');
const patternPopover = ref('');
const patternTextarea = ref('{应用名}-{日期}');
</script>

<style lang="scss" scoped>
.page-ui-kit-name-pattern {
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

.ui-kit-demo-hint {
  margin: 8px 0 0;
  color: var(--ku-text-secondary, var(--el-text-color-secondary));
  font-size: 12px;
  word-break: break-all;
}
</style>
