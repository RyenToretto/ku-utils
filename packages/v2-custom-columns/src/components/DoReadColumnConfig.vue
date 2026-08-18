<!--
@file: DoReadColumnConfig.vue
@author: koujianfeng
@description: 读取 localStorage 的列配置
 -->
<template>
  <div class="do-read-column-config">
    <template v-for="(item, key) in configList">
      <div
        :key="key"
        class="read-from-local-line"
      >
        <el-button
          class="read-from-local-config"
          :class="{ active: item.label === currentConfigLabel }"
          plain
          size="mini"
          @click="chooseColumnConfig(item)"
        >
          {{ item.label }}
        </el-button>
        <span
          v-if="!crud.existAlreadyWithSystem(item.label)"
          class="read-from-local-edit el-icon-edit"
          @click.stop="editConfig(item)"
        ></span>
        <span
          v-if="!disabledDelete && !crud.existAlreadyWithSystem(item.label)"
          class="read-from-local-delete el-icon-close"
          @click="removeConfigFromLocal(item.label)"
        ></span>
      </div>
    </template>

    <div
      v-if="!disabledCancelButton"
      class="read-from-local-line"
    >
      <el-button
        class="read-from-local-config active"
        plain
        size="mini"
        @click="cancelChooseColumnConfig"
      >
        取消
      </el-button>
    </div>
    <div
      v-if="showCustomConfigButton"
      class="read-from-local-line"
    >
      <el-button
        class="read-from-local-config custom"
        plain
        size="mini"
        @click="clickCustomConfig"
      >
        自定义配置
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DoReadColumnConfig',
  inject: {
    crud: {
      from: 'crud',
      default: null,
    },
  },
  props: {
    disabledDelete: {
      type: Boolean,
      default() {
        return false;
      },
    },
    disabledCancelButton: {
      type: Boolean,
      default() {
        return true;
      },
    },
    showCustomConfigButton: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      currentConfigLabel: '',
      configList: [],
    };
  },
  methods: {
    getColumnConfigFromLocal() {
      if (!this.crud) {
        return;
      }

      const cacheColumnConfig = this.crud.readCacheConfig();
      if (!cacheColumnConfig) {
        return;
      }
      const { activeColumnConfigLabel, columnConfig } = cacheColumnConfig;
      this.currentConfigLabel = activeColumnConfigLabel || '';
      this.configList = columnConfig || [];
    },
    editConfig(item) {
      this.$emit('edit', item);
    },
    removeConfigFromLocal(label) {
      const deleteIndex = this.configList.findIndex((item) => item.label === label);
      if (deleteIndex < 0) {
        // 未找到配置，直接返回
        return;
      }
      this.configList.splice(deleteIndex, 1);
      this.$emit('remove', label);
      this.$emit('closed');
    },
    chooseColumnConfig(config) {
      this.currentConfigLabel = config.label;
      this.$emit('confirm', config);
      this.$emit('closed');
    },
    cancelChooseColumnConfig() {
      this.$emit('closed');
    },
    clickCustomConfig() {
      this.$emit(
        'custom',
        this.configList.find((config) => config.label === this.currentConfigLabel),
      );
    },
  },
};
</script>

<style lang="less" scoped>
.do-read-column-config {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .read-from-local-line {
    margin: 10px 0 0;
    box-sizing: border-box;
    width: 100%;
    position: relative;
    .read-from-local-edit,
    .read-from-local-delete {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      display: none;
      font-size: 13px;
    }
    .read-from-local-edit {
      right: 32px;
      &:hover {
        color: #409eff;
      }
    }
    .read-from-local-delete {
      right: 10px;
      &:hover {
        color: #f56c6c;
      }
    }
    &:hover {
      .read-from-local-edit,
      .read-from-local-delete {
        display: block;
      }
    }
    .read-from-local-config {
      box-sizing: border-box;
      width: 100%;
      opacity: 0.5;
      &:first-child {
        margin-top: 0;
      }
      &.active,
      &:hover {
        background-color: #fff;
        border-color: #409eff;
        color: #409eff;
      }
      &.active {
        opacity: 1;
      }
      &.custom {
        opacity: 0.5;
      }
    }
  }
}
</style>
