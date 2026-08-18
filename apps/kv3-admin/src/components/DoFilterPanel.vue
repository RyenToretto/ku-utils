<!--
  DoFilterPanel 标准使用模板
  <DoFilterPanel
    :line="1"
    :loading="tableLoading"
    main-text="搜索"
    @search="search(true)"
  >
    <el-form
      inline
      label-width="110px"
      @submit.prevent
    >
      <el-form-item label="创建时间">
        <DateRange
          v-model="listFilters.createTimeRange"
          type="datetimerange"
          clearable
        />
      </el-form-item>
      <el-form-item label="关键字">
        <el-input
          v-model="listFilters.keyword"
          clearable
          placeholder="请输入关键字"
          style="width: 200px"
          @keyup.enter="search(true)"
          @clear="search(true)"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="listFilters.status"
          clearable
          placeholder="不限"
          style="width: 120px"
          @change="search(true)"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #ctl>
      <el-button
        :disabled="tableLoading"
        @click="handleReset"
      >
        重置
      </el-button>
    </template>
  </DoFilterPanel>

  约定：
  1. 筛选项统一包在 inline el-form 内，并使用 @submit.prevent 阻止原生提交。
  2. 搜索、回车、清空和选项变化统一调用 search(true)，确保回到第一页。
  3. 页面请求态通过 loading 传入，组件会禁用主搜索按钮，避免重复请求。
  4. 附加操作放入 #ctl；右侧操作区纵向排列（重置在上、搜索在下）。
  5. 单行筛选使用 :line="1"；多行筛选用 :line="2" 并支持折叠。
  6. handleReset 先重置 filters，再调用 search(true)；列表页优先复用 useAdminTable。
  7. 日期范围用 DateRange（禁止裸 el-date-picker 范围）；日期类筛选项必须排在所有筛选项最前；筛选日期默认可清空（`DateRange` 默认 clearable，仅合同要求必填时 `:clearable="false"`）。
-->
<template>
  <section
    class="do-filter-panel"
    :class="{
      active: !isFold,
      'can-fold': canFold,
      'has-ctl': !hideSearch,
    }"
  >
    <div class="do-filter-box">
      <div class="do-filter-body">
        <div
          class="do-filter-wrapper"
          :style="{ height: wrapperHeight }"
        >
          <div
            ref="refFilterContent"
            class="do-filter-content"
          >
            <slot />
          </div>
        </div>

        <button
          v-if="canFold"
          type="button"
          class="more-filter-option"
          :aria-expanded="!isFold"
          @click="toggleFilterFold"
        >
          <el-icon v-if="isFold"><ArrowDown /></el-icon>
          <el-icon v-else><ArrowUp /></el-icon>
          <span>{{ isFold ? '更多筛选' : '收起筛选' }}</span>
        </button>
      </div>

      <div
        v-if="!hideSearch"
        class="do-filter-ctl"
        :style="ctlStyle"
      >
        <el-button
          type="primary"
          :loading="loading"
          :disabled="loading"
          @click="emitSearch(true)"
        >
          {{ resolvedMainText }}
        </el-button>
        <slot name="ctl" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CSSProperties } from 'vue';

const props = withDefaults(
  defineProps<{
    line?: number | string;
    eachLineHeight?: number | string;
    maxCtlWidth?: string;
    hideSearch?: boolean;
    mainText?: string;
    loading?: boolean;
  }>(),
  {
    line: 2,
    eachLineHeight: 52,
    maxCtlWidth: undefined,
    hideSearch: false,
    mainText: undefined,
    loading: false,
  },
);

const emit = defineEmits<{ search: [toFirstPage: boolean] }>();
const resolvedMainText = computed(() => props.mainText ?? '搜索');

const ctlStyle = computed<CSSProperties>(() => {
  if (!props.maxCtlWidth) return {};
  return { maxWidth: props.maxCtlWidth };
});

// 初始值用 props.line，避免首帧高度不足裁剪内容
const lineCount = ref(+props.line);
const isFold = ref(true);
const timer = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
const stopObserver = ref<(() => void) | null>(null);
const refFilterContent = ref<HTMLDivElement | null>(null);

const canFold = computed(() => lineCount.value > +props.line);

const PANEL_GAP = 18;
const wrapperHeight = computed<CSSProperties['height']>(() => {
  return `${+(canFold.value && isFold.value ? props.line : lineCount.value) * +props.eachLineHeight - PANEL_GAP}px`;
});

const emitSearch = (toFirstPage: boolean) => {
  if (props.loading) return;
  emit('search', toFirstPage);
};

const toggleFilterFold = () => {
  isFold.value = !isFold.value;
};

const computedContent = () => {
  if (timer.value) clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    nextTick(() => {
      if (!refFilterContent.value) return;
      lineCount.value = +(refFilterContent.value.clientHeight / +props.eachLineHeight).toFixed();
    });
  }, 300);
};

const listenDom = () => {
  if (!refFilterContent.value) return;
  try {
    // ResizeObserver 能感知 layout reflow（如页面滚动条出现/消失导致的宽度变化），
    // MutationObserver 只能感知 DOM 节点增删，无法覆盖此场景，作为降级备用。
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => computedContent());
      ro.observe(refFilterContent.value);
      stopObserver.value = () => ro.disconnect();
    } else {
      const mo = new MutationObserver(computedContent);
      mo.observe(refFilterContent.value as Node, { subtree: true, childList: true });
      stopObserver.value = () => mo.disconnect();
    }
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  computedContent();
  window.addEventListener('resize', computedContent);
  listenDom();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', computedContent);
  stopObserver.value?.();
});
</script>

<style lang="scss" scoped>
.do-filter-panel {
  box-sizing: border-box;
  padding-bottom: 18px;
  width: 100%;

  .do-filter-box {
    display: flex;
    align-items: stretch;
    gap: 12px;
    position: relative;
  }

  .do-filter-body {
    flex: 1;
    min-width: 0;
    position: relative;
    padding: 18px 0;
    box-shadow: var(--el-box-shadow-light);
    border-radius: var(--el-card-border-radius, 4px);
    border: 1px solid var(--el-border-color-light);
    background-color: var(--el-card-bg-color);
  }

  .do-filter-wrapper {
    box-sizing: border-box;
    overflow: hidden;
    transition: height var(--el-transition-duration) ease-in-out;

    .do-filter-content {
      box-sizing: border-box;
      padding-right: 18px;
      padding-left: 18px;
    }

    :deep(.do-filter-content) {
      .el-form {
        margin-top: -10px;
        margin-bottom: -10px;
      }
      .el-form--inline .el-form-item {
        margin: 10px 10px 10px 0;
      }
      .el-date-editor--daterange.el-input__inner {
        width: 230px;
      }
    }
  }

  .do-filter-ctl {
    box-sizing: border-box;
    flex-shrink: 0;
    align-self: center;
    display: grid;
    grid-template-rows: repeat(2, minmax(32px, auto));
    grid-auto-flow: column;
    grid-auto-columns: minmax(80px, max-content);
    gap: 8px;
    padding: 0;
    direction: rtl;
    :deep(.el-button) {
      position: relative;
      margin: 0;
      min-width: 76.46px;
      width: 100%;
      padding-inline: 24px;
      direction: ltr;
    }
    :deep(.el-button .el-icon) {
      position: absolute;
      left: 8px;
      margin-right: 0;
    }
    :deep(.el-button .el-icon + span) {
      margin-left: 0;
    }
  }

  .more-filter-option {
    box-sizing: border-box;
    padding: 2px 6px;
    border: 0;
    border-bottom-color: transparent;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    font-size: 12px;
    color: var(--el-color-primary);
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--el-color-primary-light-9);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
    cursor: pointer;
  }
}

@media (prefers-reduced-motion: reduce) {
  .do-filter-panel {
    .do-filter-wrapper {
      transition: none;
    }
  }
}
</style>
