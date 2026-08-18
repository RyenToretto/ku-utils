<template>
  <div class="page-nest-menus">
    <PageHeader
      subtitle="侧栏一级 → 二级 → 三级 → 四级嵌套示例，用于验证递归菜单与层级样式。"
      :breadcrumbs="headerCrumbs"
    />

    <section class="nest-menus-card">
      <h2 class="nest-menus-card-title">当前路径层级</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(segment, idx) in nestTrail"
          :key="`${segment}-${idx}`"
        >
          {{ segment }}
        </el-breadcrumb-item>
      </el-breadcrumb>

      <dl class="nest-menus-meta">
        <div class="nest-menus-meta-row">
          <dt>菜单深度</dt>
          <dd>第 {{ nestLevel }} 级（叶子页）</dd>
        </div>
        <div class="nest-menus-meta-row">
          <dt>路由 path</dt>
          <dd>
            <code>{{ route.path }}</code>
          </dd>
        </div>
      </dl>

      <p class="nest-menus-hint">
        在左侧展开「多级导航示例」，可切换不同四级叶子；中间二、三级为分组，不可单独打开页面。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const pageTitle = computed(() => (route.meta.title as string) || '多级导航');
const nestLevel = computed(() => Number(route.meta.nestLevel) || 4);
const nestTrail = computed(() => {
  const trail = route.meta.nestTrail;
  return Array.isArray(trail) ? (trail as string[]) : [pageTitle.value];
});
const headerCrumbs = computed(() => [{ label: pageTitle.value }]);
</script>

<style lang="scss" scoped>
.page-nest-menus {
  padding: 20px 0 32px;
}

.nest-menus-card {
  margin-top: 16px;
  padding: 20px 24px;
  border-radius: 12px;
  background: var(--ku-bg-card, #fff);
  border: 1px solid var(--ku-border-light);
}

.nest-menus-card-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--ku-text-primary);
}

.nest-menus-meta {
  margin: 20px 0 0;
}

.nest-menus-meta-row {
  display: flex;
  gap: 12px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.5;

  dt {
    flex: 0 0 72px;
    margin: 0;
    color: var(--ku-text-secondary);
  }

  dd {
    margin: 0;
    color: var(--ku-text-primary);
  }

  code {
    font-family: var(--ku-font-family-mono, ui-monospace, monospace);
    font-size: 12px;
  }
}

.nest-menus-hint {
  margin: 16px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ku-text-secondary);
}
</style>
