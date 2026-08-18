<template>
  <el-dialog
    v-model="dialogVisible"
    class="dialog-edit-school-resource"
    width="520px"
    append-to-body
    destroy-on-close
    @closed="resetEditSchoolResource"
  >
    <template #header>
      <span class="el-dialog__title">
        {{ isEdit ? '修改' : '添加' }}学校
        <span
          v-if="isEdit"
          class="tips"
        >
          (ID: {{ schoolForm.id }})
        </span>
      </span>
    </template>

    <div
      v-loading="pageLoading"
      class="do-dialog-content-box"
    >
      <el-form
        ref="schoolFormRef"
        label-width="100px"
        :model="schoolForm"
        :rules="schoolRules"
      >
        <el-form-item
          label="学校名称"
          prop="schoolName"
        >
          <el-input
            v-model.trim="schoolForm.schoolName"
            clearable
            placeholder="请输入学校名称"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="schoolForm.status">
            <el-radio
              v-for="opt in $MAPS.example.schoolResource.schoolStatus.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model.trim="schoolForm.remark"
            type="textarea"
            :rows="3"
            clearable
            placeholder="选填"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="confirmEditSchoolResource"
      >
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';

import { requestEditSchoolResource } from '@/modules/_example/schoolResource/_api';
import { SCHOOL_STATUS_ENABLED } from '@/modules/_example/schoolResource/_map/schoolStatus';

const emit = defineEmits<{
  success: [];
}>();

const dialogVisible = ref(false);
const pageLoading = ref(false);
const submitLoading = ref(false);
const schoolFormRef = ref<FormInstance>();

const schoolForm = reactive({
  id: '' as string | number,
  schoolName: '',
  status: SCHOOL_STATUS_ENABLED,
  remark: '',
});

const schoolRules: FormRules = {
  schoolName: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
};

const isEdit = computed(() => !!schoolForm.id);

function resetEditSchoolResource() {
  schoolForm.id = '';
  schoolForm.schoolName = '';
  schoolForm.status = SCHOOL_STATUS_ENABLED;
  schoolForm.remark = '';
  schoolFormRef.value?.clearValidate();
}

function open(row?: { id: number; schoolName: string; status: number; remark?: string }) {
  resetEditSchoolResource();
  if (row) {
    schoolForm.id = row.id;
    schoolForm.schoolName = row.schoolName;
    schoolForm.status = row.status;
    schoolForm.remark = row.remark || '';
  }
  dialogVisible.value = true;
  pageLoading.value = true;
  window.setTimeout(() => {
    pageLoading.value = false;
  }, 120);
}

async function confirmEditSchoolResource() {
  await schoolFormRef.value?.validate();
  submitLoading.value = true;
  try {
    await requestEditSchoolResource({
      id: schoolForm.id || undefined,
      schoolName: schoolForm.schoolName,
      status: schoolForm.status,
      remark: schoolForm.remark,
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
.tips {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
  font-weight: 400;
}
</style>
