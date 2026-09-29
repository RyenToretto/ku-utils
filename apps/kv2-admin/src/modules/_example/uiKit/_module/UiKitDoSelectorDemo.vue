<template>
  <div class="page-ui-kit-do-selector">
    <PageHeader subtitle="静态 options 与 remote payload；业务页优先用专用 Selector。" />

    <el-alert
      type="warning"
      :closable="false"
      show-icon
      class="ui-kit-demo-alert"
      title="DoSelector 适合简单枚举 / 远程下拉；跨域选实体请用 XxxSelector。"
    />

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>静态 options</h3>
      <DoSelector
        v-model="staticValue"
        clearable
        style="width: 220px"
        :options="cityOptions"
        placeholder="请选择"
      >
        <template #option="{ option }">
          <el-option
            :label="String(option.label)"
            :value="String(option.value)"
          />
        </template>
      </DoSelector>
      <p class="ui-kit-demo-hint">{{ staticValue || '—' }}</p>
    </el-card>

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>远程 payload</h3>
      <DoSelector
        v-model="remoteValue"
        clearable
        style="width: 220px"
        value-key="value"
        :payload="remotePayload"
        placeholder="请选择"
        @select-change="onRemoteSelect"
      >
        <template #option="{ option }">
          <el-option
            :label="String(option.label)"
            :value="String(option.value)"
          />
        </template>
      </DoSelector>
      <p class="ui-kit-demo-hint">
        {{ remoteValue || '—' }}
        <template v-if="remoteLabel">/ {{ remoteLabel }}</template>
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const cityOptions = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '深圳', value: 'sz' },
];

const staticValue = ref('');
const remoteValue = ref('');
const remoteLabel = ref('');

const remotePayload = reactive({
  keyword: 'demo',
  requestFunc: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
      { label: '深圳', value: 'sz' },
    ];
  },
});

function onRemoteSelect(item: Record<string, unknown> | undefined) {
  remoteLabel.value = item?.label != null ? String(item.label) : '';
}
</script>

<style lang="scss" scoped>
.page-ui-kit-do-selector {
  box-sizing: border-box;
}

.ui-kit-demo-alert {
  margin-top: 12px;
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
