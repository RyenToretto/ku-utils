<template>
  <div class="do-table-header">
    <do-config-column-dialog
      ref="refConfigColumnDialog"
      @confirm="toApplyColumnConfig"
    ></do-config-column-dialog>

    <div class="table-batch">
      <slot name="batch"></slot>
    </div>

    <div class="table-control">
      <slot name="control"></slot>

      <el-popover
        v-if="!disabledColumnConfig"
        v-model="visibleDoTableControlBtn"
        placement="bottom"
        popper-class="do-table-config-popper"
        trigger="hover"
        @show="$refs.refDoReadColumnConfig.getColumnConfigFromLocal()"
      >
        <template #default>
          <do-read-column-config
            ref="refDoReadColumnConfig"
            show-custom-config-button
            @edit="toEditConfig"
            @custom="toCustomColumn"
            @remove="toRemoveConfigFromLocal"
            @closed="visibleDoTableControlBtn = false"
            @confirm="toApplyColumnConfig"
          ></do-read-column-config>
        </template>

        <template #reference>
          <el-button
            class="do-table-control-btn"
            plain
            size="mini"
          >
            自定义列
          </el-button>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script>
import DoConfigColumnDialog from './DoConfigColumnDialog.vue';
import DoReadColumnConfig from './DoReadColumnConfig.vue';

export default {
  components: {
    DoReadColumnConfig,
    DoConfigColumnDialog,
  },
  inject: {
    crud: {
      from: 'crud',
      default: null,
    },
  },
  props: {
    disabledColumnConfig: {
      type: Boolean,
      default() {
        return true;
      },
    },
  },
  data() {
    return {
      visibleDoTableControlBtn: false,
    };
  },
  methods: {
    toEditConfig(config) {
      this.visibleDoTableControlBtn = false;
      this.$nextTick(() => {
        if (this.$refs.refConfigColumnDialog) {
          this.$refs.refConfigColumnDialog.showConfigColumnDialogWithRename(config);
        }
      });
    },
    toCustomColumn(currentConfig) {
      if (!this.$refs.refConfigColumnDialog) {
        return;
      }
      this.$refs.refConfigColumnDialog.showConfigColumnDialog(currentConfig);
    },
    toApplyColumnConfig(e) {
      if (!this.crud) {
        return;
      }
      this.crud.applyColumnConfig(e);
    },
    toRemoveConfigFromLocal(e) {
      if (!this.crud) {
        return;
      }
      this.crud.removeConfigFromLocal(e);
    },
  },
};
</script>

<style lang="less">
.clear-btn-span-margin {
  &.el-button [class*='el-icon-'] + span {
    margin: 0;
  }
}
.table-config-pop {
  box-sizing: border-box;
  width: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  .table-config-content {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    > .el-button {
      margin: 6px 0 0;
      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
