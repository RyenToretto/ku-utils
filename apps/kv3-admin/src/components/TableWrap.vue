<template>
  <div
    class="table-wrap"
    role="region"
    :aria-label="ariaLabel"
  >
    <DoTableHeader
      v-if="enableDoHeader"
      :disabled-column-config="disabledColumnConfig"
    >
      <template #batch>
        <slot name="batch" />
      </template>
      <template #control>
        <slot name="control" />
      </template>
    </DoTableHeader>

    <div
      v-if="$slots.hd"
      class="table-wrap__hd"
    >
      <slot name="hd" />
    </div>

    <div class="table-wrap__bd">
      <slot />
    </div>

    <div
      v-if="$slots.ft"
      class="table-wrap__ft"
    >
      <slot name="ft" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DoTableHeader } from '@ku-utils/custom-columns';

defineOptions({ name: 'TableWrap' });

withDefaults(
  defineProps<{
    enableDoHeader?: boolean;
    disabledColumnConfig?: boolean;
    ariaLabel?: string;
  }>(),
  {
    enableDoHeader: false,
    disabledColumnConfig: true,
    ariaLabel: '数据列表',
  },
);
</script>

<style lang="scss" scoped>
.table-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;

  .table-wrap__hd {
    flex-shrink: 0;
  }

  .table-wrap__bd {
    flex: 1;
    min-width: 0;
  }
}

:deep(.do-table-header) {
  box-sizing: border-box;
  padding: 10px 10px 12px 10px;
  border-bottom: 1px solid var(--border-light);
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: padding 0.3s linear;
  .do-table-form {
    margin: 0;
    line-height: 1.5;
    > .el-form-item {
      margin: 0 12px 0 0;
      display: inline-flex;
      justify-content: flex-start;
      align-items: center;
      .el-checkbox-group {
        line-height: 1.5;
      }
    }
    &.left-gap {
      margin-left: 6px;
    }
  }
  > .table-batch {
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  > .table-control {
    box-sizing: border-box;
    padding-top: 1px;
    min-height: 32.5px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    > span > span > .el-button,
    > .el-button {
      box-sizing: border-box;
      margin-left: 0;
      margin-right: -1px;
      border-radius: 0;
      &:active {
        color: #fff;
        border-color: #3a8ee6;
        background-color: #3a8ee6;
      }
      &.mr-10 {
        margin-right: 10px;
      }
      &.all-radius {
        border-radius: 3px;
      }
      &:hover {
        border: 1px solid #3a8ee6;
        position: relative;
        z-index: 1;
      }
    }
    > span:first-child > span > .el-button,
    > .el-button:first-child {
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
    }
    > span:last-child > span > .el-button,
    > .el-button:last-child {
      margin-right: 0;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
  }
  &.hide-batch {
    padding: 0;
    border-bottom: 0 none;
  }
}
</style>
