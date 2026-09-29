<template>
  <div class="dialog-edit-club-activity-host">
    <el-dialog
      :visible.sync="dialogVisible"
      class="dialog-edit-club-activity"
      width="560px"
      append-to-body
      :close-on-click-modal="false"
      :title="isEdit ? '编辑社团活动' : '新建社团活动'"
      @closed="resetEditClubActivity"
    >
      <el-form
        ref="clubFormRef"
        v-loading="pageLoading"
        :model="clubForm"
        :rules="clubFormRules"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item
          label="活动名称"
          prop="clubName"
        >
          <el-input
            v-model.trim="clubForm.clubName"
            maxlength="60"
            clearable
            placeholder="请输入活动名称"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="clubForm.status">
            <el-radio
              v-for="item in $MAPS.example.clubActivity.clubStatus.options"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
          <span class="tips">仅启用状态可被业务引用</span>
        </el-form-item>
        <el-form-item
          label="关联学校"
          prop="schoolPick"
        >
          <SchoolSelector
            v-model="clubForm.schoolPick"
            multiple
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="confirmEditClubActivity"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Message as ElMessage } from 'element-ui';
import { computed, reactive, ref } from 'vue';

import SchoolSelector from '../../schoolResource/_module/SchoolSelector.vue';
import type { SchoolSelectorValue } from '../../schoolResource/_module/types';
import { requestEditClubActivity, type ClubActivityRow } from '../_api/clubActivity';
import { CLUB_STATUS_ENABLED } from '../_map/clubStatus';

import type { FormInstance, FormRules } from '@/types/element-ui-form';

const emit = defineEmits<{
  success: [];
}>();

const dialogVisible = ref(false);
const pageLoading = ref(false);
const submitLoading = ref(false);
const clubFormRef = ref<FormInstance>();

const clubForm = reactive({
  id: '' as string | number,
  clubName: '',
  status: CLUB_STATUS_ENABLED as number,
  schoolPick: [] as SchoolSelectorValue[],
});

const clubFormRules: FormRules = {
  clubName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  schoolPick: [
    {
      type: 'array',
      required: true,
      min: 1,
      message: '请至少选择一所学校',
      trigger: 'change',
    },
  ],
};

const isEdit = computed(() => !!clubForm.id);

function resetEditClubActivity() {
  clubForm.id = '';
  clubForm.clubName = '';
  clubForm.status = CLUB_STATUS_ENABLED;
  clubForm.schoolPick = [];
  clubFormRef.value?.clearValidate();
}

function open(row?: ClubActivityRow) {
  resetEditClubActivity();
  if (row) {
    clubForm.id = row.id;
    clubForm.clubName = row.clubName;
    clubForm.status = row.status;
    clubForm.schoolPick = (row.schools || []).map((s) => ({
      id: String(s.id),
      label: s.schoolName ? `${s.schoolName}（${s.id}）` : String(s.id),
      item: {
        id: String(s.id),
        schoolName: s.schoolName || '',
        status: 1,
        remark: '',
        createTime: '',
      },
    }));
  }
  dialogVisible.value = true;
  pageLoading.value = true;
  window.setTimeout(() => {
    pageLoading.value = false;
  }, 120);
}

async function confirmEditClubActivity() {
  await clubFormRef.value?.validate();
  submitLoading.value = true;
  try {
    await requestEditClubActivity({
      id: clubForm.id || undefined,
      clubName: clubForm.clubName,
      status: clubForm.status,
      schools: clubForm.schoolPick.map((pick) => ({
        id: String(pick.id),
        schoolName: pick.item?.schoolName || pick.label || '',
      })),
    });
    ElMessage.success(isEdit.value ? '修改成功' : '创建成功');
    dialogVisible.value = false;
    emit('success');
  } finally {
    submitLoading.value = false;
  }
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.dialog-edit-club-activity-host {
  display: contents;
}

.tips {
  margin-left: 8px;
  color: var(--ku-text-secondary, #909399);
  font-size: 13px;
  font-weight: 400;
}
</style>
