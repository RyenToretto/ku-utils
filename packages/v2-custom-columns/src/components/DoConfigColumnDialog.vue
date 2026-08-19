<!--
@file: DoConfigColumnDialog.vue
@description: 自定义列弹框 — 三栏式布局（左导航 / 中指标勾选 / 右已选列）
 -->
<template>
  <el-drawer
    custom-class="do-config-column-dialog"
    :visible.sync="dialogConfigColumnVisible"
    :append-to-body="true"
    size="1000px"
    direction="rtl"
    :before-close="handleBeforeClose"
  >
    <template #title>
      <span class="drawer-title">
        自定义列
        <span
          class="tips"
          :class="[`${newConfigName === labelNoName ? 'status-warning' : 'status-success'}`]"
        >
          ({{ newConfigName }})
        </span>
      </span>
    </template>

    <div class="drawer-wrap">
      <div class="col-dialog-body">
        <!-- 搜索栏 -->
        <div class="cfg-search">
          <el-input
            v-model="searchKeyword"
            placeholder="请搜索指标"
            prefix-icon="el-icon-search"
            clearable
            size="small"
          ></el-input>
        </div>

        <!-- 三栏面板 -->
        <div class="cfg-panels">
          <!-- 左侧分类导航 -->
          <div class="cfg-left">
            <div
              v-for="group in uniqueGroups"
              :key="group"
              class="nav-link"
              :class="{ 'is-active': activeNavGroup === group }"
              @click="scrollToGroup(group)"
            >
              {{ group }}
            </div>
          </div>

          <!-- 中间指标勾选区 -->
          <div
            ref="cfgMid"
            class="cfg-mid"
            @scroll="onMidScroll"
          >
            <div
              v-for="group in filteredGroups"
              :key="group.label"
              :ref="'grp_' + group.label"
              class="grp-section"
            >
              <div class="grp-head">
                <span class="grp-label">{{ group.label }}</span>
                <span class="grp-actions">
                  <a
                    href="javascript:"
                    @click="groupColumnAllSelect(group.label)"
                  >
                    全选
                  </a>
                  <a
                    href="javascript:"
                    @click="groupColumnReverseSelect(group.label)"
                  >
                    反选
                  </a>
                </span>
              </div>
              <div class="grp-grid">
                <div
                  v-for="col in group.children"
                  :key="col.property"
                  class="grp-item"
                >
                  <el-checkbox
                    v-model="col.visible"
                    :disabled="unableToControl(col)"
                    @change="toggleColumnCheck($event, col)"
                  >
                    {{ col.label }}
                  </el-checkbox>
                </div>
              </div>
            </div>
            <div
              v-if="filteredGroups.length === 0"
              class="grp-empty"
            >
              未找到相关指标
            </div>
          </div>

          <!-- 右侧已选列 -->
          <div class="cfg-right">
            <div class="sel-header">
              <span class="sel-count">已添加 ({{ selectedCount }}/{{ maxCount }})</span>
              <a
                class="sel-reset"
                href="javascript:"
                @click="resetConfig"
              >
                重置
              </a>
            </div>

            <div class="sel-body">
              <!-- 固定列区域（有固定列时显示） -->
              <template v-if="fixedSelectedCols.length">
                <div class="sel-fix-zone">
                  <div
                    v-for="col in fixedSelectedCols"
                    :key="col.property"
                    class="sel-fix-row"
                  >
                    <i class="el-icon-lock sel-lock"></i>
                    <span class="sel-fix-name">{{ col.label }}</span>
                  </div>
                </div>
                <div class="sel-sepline">
                  <span class="sel-septip">以上指标横向固定</span>
                </div>
              </template>

              <!-- 可拖拽列区域 -->
              <div class="sel-drag-zone">
                <draggable
                  :value="draggableSelectedCols"
                  animation="200"
                  handle=".sel-drag-handle"
                  @input="onDragReorder"
                >
                  <div
                    v-for="col in draggableSelectedCols"
                    :key="col.property"
                    class="sel-drag-row"
                  >
                    <span class="sel-drag-handle">
                      <span class="sel-drag-dots"></span>
                    </span>
                    <span
                      class="sel-drag-name"
                      :title="col.label"
                    >
                      {{ col.label }}
                    </span>
                    <i
                      class="el-icon-close sel-remove"
                      @click="removeSelectedItem(col.property)"
                    ></i>
                  </div>
                </draggable>
                <div
                  v-if="draggableSelectedCols.length === 0"
                  class="sel-empty"
                >
                  暂无已选列
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 抽屉底部操作栏（el-drawer 无 footer slot，写在 body 内） -->
      <div class="drawer-foot">
        <div class="left-btn-group">
          <el-popover
            v-model="popperSaveToLocal"
            placement="top"
            popper-class="save-to-local-popper"
            trigger="manual"
          >
            <template #default>
              <div class="save-to-local-form">
                <el-input
                  ref="inputConfigName"
                  v-model="newConfigName"
                  class="storage-key-will-save"
                  autofocus
                  placeholder="请输入配置名称"
                ></el-input>
                <el-button
                  class="save-to-local-confirm"
                  plain
                  size="small"
                  @click="cancelSaveToLocal"
                >
                  取消
                </el-button>
                <el-button
                  class="save-to-local-confirm"
                  plain
                  size="small"
                  @click="doSaveToLocal"
                >
                  保存
                </el-button>
              </div>
            </template>

            <template #reference>
              <el-button
                class="save-to-local-btn"
                @click="toSaveToLocal"
              >
                存到本地
              </el-button>
            </template>
          </el-popover>

          <el-popover
            v-model="popperReadFromLocal"
            placement="top"
            popper-class="read-from-local-popper"
            trigger="click"
          >
            <template #default>
              <do-read-column-config
                ref="doReadColumnConfig"
                @confirm="useReadConfig"
                @remove="removeChooseConfig"
                @closed="cancelChooseConfig"
              ></do-read-column-config>
            </template>

            <template #reference>
              <el-button @click="toReadFromLocal">读取本地</el-button>
            </template>
          </el-popover>
        </div>

        <div class="right-btn-group">
          <el-button @click="cancelColumnConfig">取 消</el-button>
          <el-button
            type="primary"
            @click="confirmColumnConfig"
          >
            完 成
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import Draggable from 'vuedraggable';

import DoReadColumnConfig from './DoReadColumnConfig.vue';

export default {
  name: 'DoConfigColumnDialog',
  components: {
    DoReadColumnConfig,
    Draggable,
  },
  inject: {
    crud: {
      from: 'crud',
      default: null,
    },
  },
  data() {
    return {
      popperSaveToLocal: false,
      popperReadFromLocal: false,
      dialogConfigColumnVisible: false,

      columnList: [],
      emitColumnConfig: [],
      newConfigName: (this.crud && this.crud.noNameLabel) || '未命名配置',

      searchKeyword: '',
      activeNavGroup: '',
      /** 弹窗打开时自动检测到的硬编码固定列，每次 showConfigColumnDialog 刷新 */
      detectedAlwaysCols: [],
      /** rename 模式下记录原配置名，用于允许同名覆盖保存 */
      renamingLabel: null,
    };
  },
  computed: {
    labelNoName() {
      if (!this.crud) {
        return '';
      }
      return this.crud.noNameLabel;
    },
    maxCount() {
      return (this.crud && this.crud.maxSelectCount) || 50;
    },
    selectedCount() {
      return this.emitColumnConfig.length;
    },
    /** 从 columnList 提取有序不重复的 group 名（用于左侧导航） */
    uniqueGroups() {
      const seen = new Set();
      const groups = [];
      this.columnList.forEach((item) => {
        const g = item.group || '未分组';
        if (!seen.has(g)) {
          seen.add(g);
          groups.push(g);
        }
      });
      return groups;
    },
    /**
     * 按搜索关键字过滤后的分组列表（用于中间指标区渲染）
     * 结构：[{ label: 'groupName', children: [...colItems] }]
     */
    filteredGroups() {
      const keyword = this.searchKeyword.trim().toLowerCase();
      const groupMap = new Map();

      this.columnList.forEach((item) => {
        const g = item.group || '未分组';
        if (keyword && !item.label.toLowerCase().includes(keyword)) {
          return;
        }
        if (!groupMap.has(g)) {
          groupMap.set(g, { label: g, children: [] });
        }
        groupMap.get(g).children.push(item);
      });

      return this.uniqueGroups.filter((g) => groupMap.has(g)).map((g) => groupMap.get(g));
    },
    /**
     * 硬编码固定列列表
     */
    alwaysCols() {
      const detected = this.detectedAlwaysCols || [];
      const manual = (this.crud && this.crud.alwaysVisibleColumns) || [];
      const seenProps = new Set(detected.map((c) => c.prop));
      const merged = [...detected, ...manual.filter((c) => !seenProps.has(c.prop))];
      return merged.map((col) => ({ ...col, fixed: true, _alwaysVisible: true }));
    },
    fixedSelectedCols() {
      const schemaFixed = this.emitColumnConfig.filter((col) => this.unableToControl(col));
      return [...this.alwaysCols, ...schemaFixed];
    },
    draggableSelectedCols() {
      return this.emitColumnConfig.filter((col) => !this.unableToControl(col));
    },
  },
  methods: {
    /**
     * el-drawer 的 before-close 钩子
     * 关闭后调用 crud.onDialogClose（若消费方提供）
     */
    handleBeforeClose(done) {
      this.popperSaveToLocal = false;
      this.popperReadFromLocal = false;
      done();
      this.$nextTick(() => {
        if (this.crud && typeof this.crud.onDialogClose === 'function') {
          this.crud.onDialogClose();
        }
      });
    },
    cancelColumnConfig() {
      this.popperSaveToLocal = false;
      this.popperReadFromLocal = false;
      this.dialogConfigColumnVisible = false;
      this.$nextTick(() => {
        if (this.crud && typeof this.crud.onDialogClose === 'function') {
          this.crud.onDialogClose();
        }
      });
    },
    confirmColumnConfig() {
      this.popperSaveToLocal = false;
      this.popperReadFromLocal = false;
      this.dialogConfigColumnVisible = false;
      this.$emit('confirm', {
        label: this.newConfigName || this.labelNoName,
        columns: this.emitColumnConfig
          .filter((config) => !config._alwaysVisible)
          .map((config) => config.property),
      });
    },
    showConfigColumnDialog(currentConfig) {
      if (!this.crud) {
        return;
      }
      const columnConfig = currentConfig || this.crud.getDefaultConfig();
      if (!columnConfig) {
        return;
      }

      this.detectedAlwaysCols =
        typeof this.crud._detectHardcodedCols === 'function'
          ? this.crud._detectHardcodedCols()
          : [];

      this._applyConfig(columnConfig);
      this.searchKeyword = '';
      this.dialogConfigColumnVisible = true;

      this.$nextTick(() => {
        this._syncActiveNavGroup();
      });
    },
    showConfigColumnDialogWithRename(config) {
      this.showConfigColumnDialog(config);
      this.renamingLabel = config.label;
      this.$nextTick(() => {
        this.newConfigName = config.label;
        this.popperSaveToLocal = true;
        this.popperReadFromLocal = false;
        this.$nextTick(() => {
          const { inputConfigName } = this.$refs;
          if (inputConfigName && inputConfigName.focus) {
            inputConfigName.focus();
          }
        });
      });
    },
    _applyConfig(columnConfig) {
      this.newConfigName = columnConfig.label;

      const allColumns = this.crud.tableColumns.reduce((newArr, item) => {
        const isVisible = columnConfig.columns.includes(item.property);
        return [...newArr, { ...item, visible: isVisible }];
      }, []);

      this.columnList = allColumns;

      this.emitColumnConfig = columnConfig.columns
        .map((property) => allColumns.find((col) => col.property === property))
        .filter((col) => col);
    },
    resetConfig() {
      if (!this.crud) {
        return;
      }
      const defaultConfig = this.crud.getDefaultConfig();
      if (!defaultConfig) {
        return;
      }
      this._applyConfig(defaultConfig);
      this.updateNewConfigName();
    },
    unableToControl(col) {
      return col.type === 'selection' || col.fixed || col.label === '操作';
    },
    onDragReorder(newDraggableOrder) {
      const schemaFixed = this.fixedSelectedCols.filter((col) => !col._alwaysVisible);
      this.emitColumnConfig = [...schemaFixed, ...newDraggableOrder];
      this.updateNewConfigName();
    },
    updateEmitColumnConfig() {
      const currentProperties = this.emitColumnConfig.map((col) => col.property);
      const newVisibleProperties = this.columnList
        .filter((col) => col.visible)
        .map((col) => col.property);

      this.emitColumnConfig = this.emitColumnConfig.filter((col) =>
        newVisibleProperties.includes(col.property),
      );

      newVisibleProperties.forEach((property) => {
        if (!currentProperties.includes(property)) {
          const col = this.columnList.find((c) => c.property === property);
          if (col) {
            this.emitColumnConfig.push(col);
          }
        }
      });

      this.updateNewConfigName();
    },
    updateNewConfigName() {
      if (!this.crud) {
        return;
      }
      const cacheColumnConfig = this.crud.readCacheConfig();
      if (!cacheColumnConfig) {
        return;
      }
      const tempConfig = this.emitColumnConfig.map((item) => item.property);
      let found = false;
      cacheColumnConfig.columnConfig.forEach((config) => {
        if (JSON.stringify(config.columns) === JSON.stringify(tempConfig)) {
          found = true;
          this.newConfigName = config.label;
        }
      });
      if (!found) {
        this.newConfigName = this.crud.noNameLabel;
      }
    },
    toggleColumnCheck(checked, col) {
      if (checked && !this.unableToControl(col)) {
        const willCount = this.emitColumnConfig.filter((c) => !this.unableToControl(c)).length + 1;
        if (willCount > this.maxCount) {
          this.$message.warning(`已选列数量已达上限 ${this.maxCount} 个`);
          this.$nextTick(() => {
            col.visible = false;
          });
          return;
        }
      }
      this.updateEmitColumnConfig();
    },
    groupColumnAllSelect(group) {
      this.columnList.forEach((item) => {
        if (!this.unableToControl(item)) {
          const itemGroup = item.group || '未分组';
          if (itemGroup === group) {
            item.visible = true;
          }
        }
      });
      this.updateEmitColumnConfig();
    },
    groupColumnReverseSelect(group) {
      this.columnList.forEach((item) => {
        if (!this.unableToControl(item)) {
          const itemGroup = item.group || '未分组';
          if (itemGroup === group) {
            item.visible = !item.visible;
          }
        }
      });
      this.updateEmitColumnConfig();
    },
    removeSelectedItem(property) {
      const col = this.columnList.find((c) => c.property === property);
      if (col) {
        col.visible = false;
      }
      this.emitColumnConfig = this.emitColumnConfig.filter((c) => c.property !== property);
      this.updateNewConfigName();
    },
    scrollToGroup(group) {
      this.activeNavGroup = group;
      const refKey = `grp_${group}`;
      const refEl = this.$refs[refKey];
      const el = Array.isArray(refEl) ? refEl[0] : refEl;
      if (el) {
        const domEl = el.$el || el;
        const midPanel = this.$refs.cfgMid;
        if (midPanel && domEl) {
          midPanel.scrollTo({ top: domEl.offsetTop - midPanel.offsetTop, behavior: 'smooth' });
        }
      }
    },
    onMidScroll() {
      const midPanel = this.$refs.cfgMid;
      if (!midPanel) return;
      const scrollTop = midPanel.scrollTop;

      for (let i = this.uniqueGroups.length - 1; i >= 0; i--) {
        const group = this.uniqueGroups[i];
        const refKey = `grp_${group}`;
        const refEl = this.$refs[refKey];
        const el = Array.isArray(refEl) ? refEl[0] : refEl;
        if (!el) continue;
        const domEl = el.$el || el;
        if (domEl.offsetTop - midPanel.offsetTop <= scrollTop + 8) {
          this.activeNavGroup = group;
          break;
        }
      }
    },
    _syncActiveNavGroup() {
      if (this.uniqueGroups.length > 0) {
        this.activeNavGroup = this.uniqueGroups[0];
      }
    },
    toReadFromLocal() {
      this.popperSaveToLocal = false;
      if (this.$refs.doReadColumnConfig) {
        this.$refs.doReadColumnConfig.getColumnConfigFromLocal();
      }
    },
    cancelChooseConfig() {
      this.popperReadFromLocal = false;
    },
    removeChooseConfig(label) {
      this.crud && this.crud.removeConfigFromLocal(label);
    },
    useReadConfig(config) {
      if (!this.crud || !config || !config.label || !this.columnList.length) {
        return;
      }
      if (!config.columns || !config.columns.length || config.columns.includes('ALL')) {
        return this.useReadConfig({
          label: config.label,
          columns: this.crud.tableColumns.map((each) => each.property),
        });
      }
      this.popperReadFromLocal = false;
      this.newConfigName = config.label;

      this.columnList.forEach((item) => {
        item.visible = config.columns.includes(item.property);
      });

      this.emitColumnConfig = config.columns
        .map((property) => this.columnList.find((col) => col.property === property))
        .filter((col) => col);
    },
    toSaveToLocal() {
      this.newConfigName = '';
      this.popperSaveToLocal = true;
      this.popperReadFromLocal = false;
      this.$nextTick(() => {
        const { inputConfigName } = this.$refs;
        if (inputConfigName && inputConfigName.focus) {
          inputConfigName.focus();
        }
      });
    },
    doSaveToLocal() {
      if (!this.crud || !this.newConfigName || !this.newConfigName.trim()) {
        this.$message.warning('请输入配置名称');
        return;
      }

      const configName = this.newConfigName.trim();
      const currentColumns = this.emitColumnConfig.map((config) => config.property);

      // rename 模式下，若名称未变，直接覆盖更新已有配置
      if (this.renamingLabel && configName === this.renamingLabel) {
        this.crud.updateConfigInLocal(this.renamingLabel, configName, currentColumns);
        this.popperSaveToLocal = false;
        this.renamingLabel = null;
        this.$message.success('配置已保存');
        return;
      }

      const existingConfig = this.crud.readCacheConfig();
      if (existingConfig && existingConfig.columnConfig) {
        const isDuplicate = existingConfig.columnConfig.some((c) => c.label === configName);
        if (isDuplicate) {
          this.$message.warning('配置名称已存在，请使用其他名称');
          return;
        }
      }

      this.crud.saveConfigToLocal(configName, currentColumns);
      this.popperSaveToLocal = false;
      this.renamingLabel = null;
      this.$message.success('配置已保存');
    },
    cancelSaveToLocal() {
      this.updateNewConfigName();
      this.popperSaveToLocal = false;
      this.renamingLabel = null;
    },
  },
};
</script>

<style lang="less" scoped>
.do-config-column-dialog {
  .drawer-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .col-dialog-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px 0 12px;

    .cfg-search {
      padding: 0 20px;
      flex-shrink: 0;
    }

    .cfg-panels {
      display: flex;
      flex: 1;
      border: 1px solid var(--ku-border-light, #e5e6eb);
      border-radius: 2px;
      overflow: hidden;

      .cfg-left {
        width: 240px;
        flex-shrink: 0;
        overflow-y: auto;
        border-right: 1px solid var(--ku-border-light, #e5e6eb);
        background: var(--ku-neutral-50, #fafafa);
        padding: 8px 0;

        .nav-link {
          padding: 8px 16px;
          font-size: 13px;
          color: var(--ku-text-secondary, #646a73);
          cursor: pointer;
          line-height: 1.4;
          transition:
            background 0.15s,
            color 0.15s;

          &:hover {
            background: var(--ku-bg-hover, rgba(51, 112, 255, 0.06));
            color: var(--ku-text-primary, #1f2329);
          }

          &.is-active {
            color: var(--ku-color-primary, #3370ff);
            background: var(--ku-color-primary-bg, #f0f4ff);
            font-weight: 500;
          }
        }
      }

      .cfg-mid {
        flex: 1;
        overflow-y: auto;
        padding: 0;

        .grp-section {
          .grp-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 10px 8px;
            position: sticky;
            top: 0;
            background: var(--ku-bg-card, #ffffff);
            z-index: 9;

            .grp-label {
              font-size: 13px;
              font-weight: 600;
              color: var(--ku-text-primary, #1f2329);
            }

            .grp-actions {
              display: flex;
              gap: 8px;

              a {
                font-size: 12px;
                color: var(--ku-color-primary, #3370ff);
                text-decoration: none;

                &:hover {
                  text-decoration: underline;
                }
              }
            }
          }

          .grp-grid {
            padding: 0 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 8px;

            .grp-item {
              padding: 4px 0;

              :deep(.el-checkbox) {
                display: flex;
                align-items: center;
                width: 100%;
                margin-right: 0;

                .el-checkbox__label {
                  font-size: 13px;
                  color: var(--ku-text-secondary, #646a73);
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
              }
            }
          }
        }

        .grp-empty {
          padding: 48px 16px;
          text-align: center;
          color: var(--ku-text-placeholder, #8f959e);
          font-size: 13px;
        }
      }

      .cfg-right {
        width: 280px;
        flex-shrink: 0;
        border-left: 1px solid var(--ku-border-light, #e5e6eb);
        display: flex;
        flex-direction: column;
        background: var(--ku-bg-card, #ffffff);

        .sel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid var(--ku-border-light, #e5e6eb);
          background: var(--ku-table-header-bg, #f5f6f7);
          flex-shrink: 0;

          .sel-count {
            font-size: 13px;
            color: var(--ku-text-secondary, #646a73);
            font-weight: 500;
          }

          .sel-reset {
            font-size: 12px;
            color: var(--ku-color-primary, #3370ff);
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .sel-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;

          .sel-fix-zone {
            flex-shrink: 0;

            .sel-fix-row {
              display: flex;
              align-items: center;
              padding: 0 12px;
              height: 36px;
              background: var(--ku-table-header-bg, #f5f6f7);
              border-bottom: 1px solid var(--ku-bg-hover, rgba(51, 112, 255, 0.06));

              .sel-lock {
                font-size: 12px;
                color: var(--ku-text-disabled, #bbbfc4);
                margin-right: 8px;
                flex-shrink: 0;
              }

              .sel-fix-name {
                font-size: 13px;
                color: var(--ku-text-secondary, #646a73);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }

          .sel-sepline {
            display: flex;
            align-items: center;
            padding: 6px 12px;
            flex-shrink: 0;
            background: var(--ku-bg-card, #ffffff);

            &::before,
            &::after {
              content: '';
              flex: 1;
              border-top: 1px dashed var(--ku-border-default, #dee0e3);
            }

            .sel-septip {
              padding: 0 8px;
              font-size: 11px;
              color: var(--ku-text-disabled, #bbbfc4);
              white-space: nowrap;
            }
          }

          .sel-drag-zone {
            flex: 1;

            .sel-drag-row {
              display: flex;
              align-items: center;
              height: 36px;
              padding: 0 4px 0 8px;
              border-bottom: 1px solid var(--ku-table-header-bg, #f5f6f7);
              transition: background 0.12s;

              &:hover {
                background: var(--ku-table-header-bg, #f5f6f7);
              }

              .sel-drag-handle {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 100%;
                cursor: grab;
                flex-shrink: 0;
                color: var(--ku-text-disabled, #bbbfc4);

                &:active {
                  cursor: grabbing;
                }

                .sel-drag-dots {
                  display: inline-block;
                  width: 6px;
                  height: 14px;
                  background-image: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
                  background-size: 3px 4px;
                  background-repeat: repeat;
                }
              }

              .sel-drag-name {
                flex: 1;
                font-size: 13px;
                color: var(--ku-text-primary, #1f2329);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin: 0 4px;
              }

              .sel-remove {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: var(--ku-text-disabled, #bbbfc4);
                cursor: pointer;
                border-radius: 3px;
                transition:
                  color 0.15s,
                  background 0.15s;

                &:hover {
                  color: var(--ku-color-danger, #f54a45);
                  background: var(--ku-color-danger-bg, #fef1f1);
                }
              }
            }

            .sel-empty {
              padding: 24px 12px;
              text-align: center;
              font-size: 13px;
              color: var(--ku-text-disabled, #bbbfc4);
            }
          }
        }
      }
    }
  }

  .drawer-foot {
    flex-shrink: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-top: 1px solid var(--ku-border-light, #e5e6eb);

    .left-btn-group {
      > span {
        margin-right: 10px;
      }

      > button {
        margin-left: 0;
        margin-right: 10px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .cfg-left,
  .cfg-mid,
  .sel-body {
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      background: var(--ku-scrollbar-thumb, #c6c9ce);
    }

    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
      border-radius: 0;
      background: var(--ku-border-light, #e5e6eb);
    }
  }
}
</style>

<style lang="less">
.do-config-column-dialog {
  .el-drawer__body {
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
.save-to-local-popper {
  .save-to-local-form {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .storage-key-will-save {
      box-sizing: border-box;
      width: 400px;
    }

    .save-to-local-confirm {
      margin-left: 10px;
      box-sizing: border-box;
    }
  }
}
</style>
