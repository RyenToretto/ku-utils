<template>
  <header class="page-header">
    <div class="page-head__main">
      <div class="page-head__title-row">
        <div class="page-head__titles">
          <div class="page-head__title-line">
            <div class="page-head__title-main">
              <slot name="breadcrumb">
                <nav
                  v-if="resolvedCrumbs.length > 0"
                  class="page-head__breadcrumb"
                  aria-label="面包屑"
                >
                  <el-breadcrumb
                    class="page-crumb"
                    separator="/"
                  >
                    <el-breadcrumb-item
                      v-for="(item, index) in resolvedCrumbs"
                      :key="`${item.label}-${index}`"
                      class="prev-page-title"
                    >
                      <h2 v-if="item.to && index < resolvedCrumbs.length - 1">
                        {{ item.label }}
                      </h2>
                      <h1
                        v-else
                        aria-current="page"
                      >
                        {{ item.label }}
                      </h1>
                    </el-breadcrumb-item>
                  </el-breadcrumb>
                </nav>
                <h1
                  v-else-if="fallbackTitle"
                  class="page-title"
                >
                  {{ fallbackTitle }}
                </h1>
              </slot>
            </div>
            <div
              v-if="$slots['title-right']"
              class="page-head__title-right"
            >
              <slot name="title-right" />
            </div>
          </div>
          <p
            v-if="subtitle"
            class="page-subtitle"
          >
            {{ subtitle }}
          </p>
        </div>
        <div
          v-if="$slots.actions"
          class="page-head__actions"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export type PageBreadcrumbItem = {
  label: string;
  /** 可跳转路径；末级当前页通常不传 */
  to?: string;
};

const props = withDefaults(
  defineProps<{
    subtitle?: string;
    breadcrumbs?: PageBreadcrumbItem[];
  }>(),
  {
    subtitle: '',
    breadcrumbs: undefined,
  },
);

const route = useRoute();

const fallbackTitle = computed(() => {
  const title = route.meta?.title;
  return typeof title === 'string' ? title : '';
});

const resolvedCrumbs = computed(() => {
  if (props.breadcrumbs && props.breadcrumbs.length > 0) {
    return props.breadcrumbs;
  }
  if (!fallbackTitle.value) return [];
  return [{ label: fallbackTitle.value }] satisfies PageBreadcrumbItem[];
});
</script>

<style lang="scss" scoped>
.page-head__bread_link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--el-transition-duration-fast);

  &:hover {
    color: var(--el-color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.page-head__bread_current {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
