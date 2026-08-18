<template>
  <div class="dialog-edit-club-activity-host">
    <el-dialog
      v-model="dialogVisible"
      class="dialog-edit-club-activity"
      width="600px"
      append-to-body
      destroy-on-close
      @closed="resetEditClubActivity"
    >
      <template #header>
        <span class="el-dialog__title">
          {{ isEdit ? '修改' : '添加' }}社团活动
          <span
            v-if="isEdit"
            class="tips"
          >
            (ID: {{ clubForm.id }})
          </span>
        </span>
      </template>

      <div
        v-loading="pageLoading"
        class="do-dialog-content-box"
      >
        <el-form
          ref="clubFormRef"
          label-width="100px"
          :model="clubForm"
          :rules="clubRules"
        >
          <el-form-item
            label="社团名称"
            prop="clubName"
          >
            <el-input
              v-model.trim="clubForm.clubName"
              clearable
              placeholder="请输入社团名称"
            />
          </el-form-item>
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-radio-group v-model="clubForm.status">
              <el-radio
                v-for="opt in $MAPS.example.clubActivity.clubStatus.options"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="参与学校"
            prop="schools"
          >
            <div class="school-pick-block">
              <el-button
                size="small"
                @click="openSchoolSelector"
              >
                {{ clubForm.schools.length ? '重新选择' : '选择学校（多选）' }}
              </el-button>
              <div
                v-if="clubForm.schools.length"
                class="school-tag-list"
              >
                <el-tag
                  v-for="school in clubForm.schools"
                  :key="school.id"
                  closable
                  type="info"
                  @close="removeSchool(school.id)"
                >
                  {{ school.schoolName }}
                </el-tag>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="confirmEditClubActivity"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>

    <DialogSelectSchoolResource
      ref="schoolSelectorRef"
      :multiple="true"
      :lock-enabled-status="true"
      :default-page-size="5"
      @change="onSchoolsChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';

import {
  requestEditClubActivity,
  type ClubActivityRow,
  type ClubSchoolItem,
} from '@/modules/_example/clubActivity/_api';
import { CLUB_STATUS_ENABLED } from '@/modules/_example/clubActivity/_map/clubStatus';
import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';
import DialogSelectSchoolResource from '@/modules/_example/schoolResource/_module/DialogSelectSchoolResource.vue';

const emit = defineEmits<{
  success: [];
}>();

const dialogVisible = ref(false);
const pageLoading = ref(false);
const submitLoading = ref(false);
const clubFormRef = ref<FormInstance>();
const schoolSelectorRef = ref<InstanceType<typeof DialogSelectSchoolResource>>();

const clubForm = reactive({
  id: '' as string | number,
  clubName: '',
  status: CLUB_STATUS_ENABLED,
  schools: [] as ClubSchoolItem[],
});

const clubRules: FormRules = {
  clubName: [{ required: true, message: '请输入社团名称', trigger: 'blur' }],
  schools: [
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
  clubForm.schools = [];
  clubFormRef.value?.clearValidate();
}

function open(row?: ClubActivityRow) {
  resetEditClubActivity();
  if (row) {
    clubForm.id = row.id;
    clubForm.clubName = row.clubName;
    clubForm.status = row.status;
    clubForm.schools = (row.schools || []).map((s) => ({
      id: s.id,
      schoolName: s.schoolName,
    }));
  }
  dialogVisible.value = true;
  pageLoading.value = true;
  window.setTimeout(() => {
    pageLoading.value = false;
  }, 120);
}

function openSchoolSelector() {
  const current = clubForm.schools.map(
    (s) =>
      ({
        id: s.id,
        schoolName: s.schoolName,
        status: 1,
        remark: '',
        createTime: '',
      }) as SchoolResourceRow,
  );
  schoolSelectorRef.value?.show(
    current.map((s) => s.id),
    current,
  );
}

function onSchoolsChange(evt: SchoolResourceRow | SchoolResourceRow[] | undefined) {
  const list = Array.isArray(evt) ? evt : evt ? [evt] : [];
  clubForm.schools = list
    .filter((row) => row?.id != null)
    .map((row) => ({
      id: Number(row.id),
      schoolName: String(row.schoolName || ''),
    }));
  clubFormRef.value?.validateField('schools');
}

function removeSchool(id: number) {
  clubForm.schools = clubForm.schools.filter((s) => s.id !== id);
}

async function confirmEditClubActivity() {
  await clubFormRef.value?.validate();
  submitLoading.value = true;
  try {
    await requestEditClubActivity({
      id: clubForm.id || undefined,
      clubName: clubForm.clubName,
      status: clubForm.status,
      schools: clubForm.schools,
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
  color: #909399;
  font-size: 13px;
  font-weight: 400;
}

.school-pick-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.school-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
