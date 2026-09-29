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
            prop="schoolPick"
          >
            <SchoolSelector v-model="clazzForm.schoolPick" />
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
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';

import { requestEditClazzManage } from '@/modules/_example/clazzManage/_api';
import { CLAZZ_STATUS_ENABLED } from '@/modules/_example/clazzManage/_map/clazzStatus';
import SchoolSelector from '@/modules/_example/schoolResource/_module/SchoolSelector.vue';
import type { SchoolSelectorValue } from '@/modules/_example/schoolResource/_module/types';

const emit = defineEmits<{
  success: [];
}>();

const dialogVisible = ref(false);
const pageLoading = ref(false);
const submitLoading = ref(false);
const clazzFormRef = ref<FormInstance>();

const clazzForm = reactive({
  id: '' as string | number,
  clazzName: '',
  status: CLAZZ_STATUS_ENABLED,
  schoolPick: null as SchoolSelectorValue | null,
});

const clazzRules: FormRules = {
  clazzName: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  schoolPick: [
    {
      validator: (_rule, value, callback) => {
        if (!value) callback(new Error('请选择所属学校'));
        else callback();
      },
      trigger: 'change',
    },
  ],
};

const isEdit = computed(() => !!clazzForm.id);

function resetEditClazzManage() {
  clazzForm.id = '';
  clazzForm.clazzName = '';
  clazzForm.status = CLAZZ_STATUS_ENABLED;
  clazzForm.schoolPick = null;
  clazzFormRef.value?.clearValidate();
}

function open(row?: {
  id: number;
  clazzName: string;
  status: number;
  schoolId: string | number | null;
  schoolName: string;
}) {
  resetEditClazzManage();
  if (row) {
    clazzForm.id = row.id;
    clazzForm.clazzName = row.clazzName;
    clazzForm.status = row.status;
    if (row.schoolId != null) {
      clazzForm.schoolPick = {
        id: String(row.schoolId),
        label: row.schoolName ? `${row.schoolName}（${row.schoolId}）` : String(row.schoolId),
        item: {
          id: String(row.schoolId),
          schoolName: row.schoolName || '',
          status: 1,
          remark: '',
          createTime: '',
        },
      };
    }
  }
  dialogVisible.value = true;
  pageLoading.value = true;
  window.setTimeout(() => {
    pageLoading.value = false;
  }, 120);
}

async function confirmEditClazzManage() {
  await clazzFormRef.value?.validate();
  submitLoading.value = true;
  try {
    await requestEditClazzManage({
      id: clazzForm.id || undefined,
      clazzName: clazzForm.clazzName,
      status: clazzForm.status,
      schoolId: clazzForm.schoolPick?.id ?? null,
      schoolName: clazzForm.schoolPick?.item.schoolName || clazzForm.schoolPick?.label || '',
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
  color: var(--ku-text-secondary, #909399);
  font-size: 13px;
  font-weight: 400;
}
</style>
