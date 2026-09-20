<template>
  <div class="page-ui-kit-max-height">
    <PageHeader
      subtitle="多筛选项 + 宽表 + useAdminTableMaxHeight；折叠筛选后表格高度应重新收敛。"
    />

    <DoFilterPanel
      :line="1"
      :loading="tableLoading"
      @search="search(true)"
    >
      <el-form
        class="with-btn"
        inline
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="日期">
          <DateRange
            v-model="listFilters.dateRange"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="关键字">
          <el-input
            v-model="listFilters.keyword"
            clearable
            style="width: 180px"
            placeholder="不限"
            @keyup.enter="search(true)"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          label-width="52px"
        >
          <el-radio-group
            v-model="listFilters.status"
            size="small"
            @change="search(true)"
          >
            <el-radio-button value="">不限</el-radio-button>
            <el-radio-button :value="1">启用</el-radio-button>
            <el-radio-button :value="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input
            v-model="listFilters.owner"
            clearable
            style="width: 140px"
            placeholder="不限"
          />
        </el-form-item>
        <el-form-item label="渠道">
          <el-select
            v-model="listFilters.channel"
            clearable
            style="width: 140px"
            placeholder="不限"
          >
            <el-option
              v-for="opt in channelOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-select
            v-model="listFilters.region"
            clearable
            style="width: 140px"
            placeholder="不限"
          >
            <el-option
              v-for="opt in regionOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="listFilters.tag"
            clearable
            style="width: 140px"
            placeholder="不限"
          />
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

    <TableWrap>
      <el-table
        v-loading="tableLoading"
        class="do-inner-scroller page-table hide-table-border"
        :data="tableData"
        :max-height="maxHeight"
        border
        stripe
      >
        <el-table-column
          label="名称"
          prop="name"
          min-width="200"
          fixed="left"
        />
        <el-table-column
          label="列 A"
          prop="colA"
          min-width="140"
        />
        <el-table-column
          label="列 B"
          prop="colB"
          min-width="140"
        />
        <el-table-column
          label="列 C"
          prop="colC"
          min-width="140"
        />
        <el-table-column
          label="列 D"
          prop="colD"
          min-width="140"
        />
        <el-table-column
          label="列 E"
          prop="colE"
          min-width="140"
        />
        <el-table-column
          label="列 F"
          prop="colF"
          min-width="140"
        />
        <el-table-column
          label="创建时间"
          prop="createdAt"
          width="160"
        >
          <template #default="{ row }">
            <CellDateTime
              layout="with-actor"
              :value="row.createdAt"
              :actor="row.owner"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="220"
          fixed="right"
          align="left"
          class-name="ops-column"
        >
          <template #header>
            <el-button
              type="primary"
              size="small"
            >
              新建
            </el-button>
          </template>
          <template #default>
            <div class="line-actions">
              <el-button
                plain
                size="small"
              >
                编辑
              </el-button>
              <el-button
                plain
                size="small"
              >
                复制
              </el-button>
              <el-button
                plain
                size="small"
                type="primary"
              >
                立即使用
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <template #ft>
        <BasePagination
          :page-num="listFilters.pageNum"
          :page-size="listFilters.pageSize"
          :total="tableTotal"
          :page-sizes="[10, 20, 50]"
          @update:page-num="handlePageNumChange"
          @update:page-size="handlePageSizeChange"
        />
      </template>
    </TableWrap>
  </div>
</template>

<script setup lang="ts">
import { useAdminTable } from '@/composables/useAdminTable';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';

interface DemoRow {
  id: string;
  name: string;
  colA: string;
  colB: string;
  colC: string;
  colD: string;
  colE: string;
  colF: string;
  owner: string;
  status: number;
  createdAt: string;
  channel: string;
  region: string;
  tag: string;
  [key: string]: unknown;
}

const maxHeight = useAdminTableMaxHeight('.page-ui-kit-max-height', 400);

const channelOptions = [
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Meta', value: 'meta' },
];

const regionOptions = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '深圳', value: 'sz' },
];

const seedRows: DemoRow[] = Array.from({ length: 16 }, (_, i) => {
  const n = i + 1;
  return {
    id: String(n),
    name: `演示策略 ${n}`,
    colA: `列A-${n}`,
    colB: `列B-${n}`,
    colC: `列C-${n}`,
    colD: `列D-${n}`,
    colE: `列E-${n}`,
    colF: `列F-${n}`,
    owner: n % 2 === 0 ? '王婧婷' : '张伟',
    status: n % 3 === 0 ? 0 : 1,
    createdAt: `2026-08-${String((n % 28) + 1).padStart(2, '0')}T12:00:00+08:00`,
    channel: n % 2 === 0 ? 'tiktok' : 'meta',
    region: ['bj', 'sh', 'sz'][n % 3]!,
    tag: `tag-${n}`,
  };
});

const {
  listFilters,
  tableData,
  tableLoading,
  tableTotal,
  search,
  resetListFilters,
  handlePageNumChange,
  handlePageSizeChange,
} = useAdminTable({
  defaultFilters: {
    dateRange: undefined as string[] | undefined,
    keyword: '',
    status: '' as string | number,
    owner: '',
    channel: '',
    region: '',
    tag: '',
  },
  defaultPageSize: 20,
  fetcher: async (query) => {
    const keyword = String(query.keyword ?? '').trim();
    const status = query.status;
    const owner = String(query.owner ?? '').trim();
    const channel = String(query.channel ?? '');
    const region = String(query.region ?? '');
    const tag = String(query.tag ?? '').trim();
    let lists = seedRows.filter((row) => {
      if (keyword && !row.name.includes(keyword) && !row.id.includes(keyword)) return false;
      if (status !== '' && status != null && Number(status) !== row.status) return false;
      if (owner && !row.owner.includes(owner)) return false;
      if (channel && row.channel !== channel) return false;
      if (region && row.region !== region) return false;
      if (tag && !row.tag.includes(tag)) return false;
      return true;
    });
    const pageNum = Number(query.pageNum) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const total = lists.length;
    const start = (pageNum - 1) * pageSize;
    lists = lists.slice(start, start + pageSize);
    return { lists, total };
  },
});

function handleReset() {
  resetListFilters();
}
</script>

<style lang="scss" scoped>
.page-ui-kit-max-height {
  box-sizing: border-box;
}
</style>
