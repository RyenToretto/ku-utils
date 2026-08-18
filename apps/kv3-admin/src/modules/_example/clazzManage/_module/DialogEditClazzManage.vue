<template>
  <div class="dialog-edit-clazz-manage-host">
    <el-dialog
      v-model="dialogVisible"
      class="dialog-edit-clazz-manage"
      width="560px"
      append-to-body
      destroy-on-close
      @closed="resetEditClazzManage"
    >
      <template #header>
        <span class="el-dialog__title">
          {{ isEdit ? '修改' : '添加' }}班级
          <span
            v-if="isEdit"
            class="tips"
          >
            (ID: {{ clazzForm.id }})
          </span>
        </span>
      </template>

      <div
        v-loading="pageLoading"
        class="do-dialog-content-box"
      >
        <el-form
          ref="clazzFormRef"
          label-width="100px"
          :model="clazzForm"
          :rules="clazzRules"
        >
          <el-form-item
            label="班级名称"
            prop="clazzName"
          >
            <el-input
              v-model.trim="clazzForm.clazzName"
              clearable
              placeholder="请输入班级名称"
            />
          </el-form-item>
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-radio-group v-model="clazzForm.status">
              <el-radio
                v-for="opt in $MAPS.example.clazzManage.clazzStatus.options"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="所属学校"
            prop="schoolId"
          >
            <div class="school-pick-row">
              <el-button
                size="small"
                @click="openSchoolSelector"
              >
                {{ clazzForm.schoolId ? '重新选择' : '选择学校' }}
              </el-button>
              <el-tag
                v-if="clazzForm.schoolId"
                class="school-tag"
                closable
                type="info"
                @close="clearSchool"
              >
                {{ clazzForm.schoolName }}
              </el-tag>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="confirmEditClazzManage"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>

    <DialogSelectSchoolResource
      ref="schoolSelectorRef"
      :multiple="false"
      :lock-enabled-status="true"
      @change="onSchoolChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';

import { requestEditClazzManage } from '@/modules/_example/clazzManage/_api';
import { CLAZZ_STATUS_ENABLED } from '@/modules/_example/clazzManage/_map/clazzStatus';
import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';
import DialogSelectSchoolResource from '@/modules/_example/schoolResource/_module/DialogSelectSchoolResource.vue';

const emit = defineEmits<{
  success: [];
}>();

const dialogVisible = ref(false);
const pageLoading = ref(false);
const submitLoading = ref(false);
const clazzFormRef = ref<FormInstance>();
const schoolSelectorRef = ref<InstanceType<typeof DialogSelectSchoolResource>>();

const clazzForm = reactive({
  id: '' as string | number,
  clazzName: '',
  status: CLAZZ_STATUS_ENABLED,
  schoolId: null as number | null,
  schoolName: '',
});

const clazzRules: FormRules = {
  clazzName: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  schoolId: [{ required: true, message: '请选择所属学校', trigger: 'change' }],
};

const isEdit = computed(() => !!clazzForm.id);

function resetEditClazzManage() {
  clazzForm.id = '';
  clazzForm.clazzName = '';
  clazzForm.status = CLAZZ_STATUS_ENABLED;
  clazzForm.schoolId = null;
  clazzForm.schoolName = '';
  clazzFormRef.value?.clearValidate();
}

function open(row?: {
  id: number;
  clazzName: string;
  status: number;
  schoolId: number | null;
  schoolName: string;
}) {
  resetEditClazzManage();
  if (row) {
    clazzForm.id = row.id;
    clazzForm.clazzName = row.clazzName;
    clazzForm.status = row.status;
    clazzForm.schoolId = row.schoolId;
    clazzForm.schoolName = row.schoolName || '';
  }
  dialogVisible.value = true;
  pageLoading.value = true;
  window.setTimeout(() => {
    pageLoading.value = false;
  }, 120);
}

function openSchoolSelector() {
  const current =
    clazzForm.schoolId != null
      ? [
          {
            id: clazzForm.schoolId,
            schoolName: clazzForm.schoolName,
            status: 1,
            remark: '',
            createTime: '',
          } as SchoolResourceRow,
        ]
      : [];
  schoolSelectorRef.value?.show([], current);
}

function onSchoolChange(evt: SchoolResourceRow | SchoolResourceRow[] | undefined) {
  const row = Array.isArray(evt) ? evt[0] : evt;
  if (!row?.id) {
    clearSchool();
    return;
  }
  clazzForm.schoolId = Number(row.id);
  clazzForm.schoolName = String(row.schoolName || '');
  clazzFormRef.value?.validateField('schoolId');
}

function clearSchool() {
  clazzForm.schoolId = null;
  clazzForm.schoolName = '';
}

async function confirmEditClazzManage() {
  await clazzFormRef.value?.validate();
  submitLoading.value = true;
  try {
    await requestEditClazzManage({
      id: clazzForm.id || undefined,
      clazzName: clazzForm.clazzName,
      status: clazzForm.status,
      schoolId: clazzForm.schoolId,
      schoolName: clazzForm.schoolName,
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
.dialog-edit-clazz-manage-host {
  display: contents;
}

.tips {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
  font-weight: 400;
}

.school-pick-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.school-tag {
  max-width: 280px;
}
</style>
