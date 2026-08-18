<template>
  <el-dialog
    v-model="dialogVisible"
    class="dialog-edit-simple-example"
    width="520px"
    append-to-body
    destroy-on-close
    @closed="resetEditSimpleExample"
  >
    <template #header>
      <span class="el-dialog__title">
        {{ isEdit ? '修改' : '添加' }}示例
        <span
          v-if="isEdit"
          class="tips"
        >
          (ID: {{ exampleForm.id }})
        </span>
      </span>
    </template>

    <div
      v-loading="pageLoading"
      class="do-dialog-content-box"
    >
      <el-form
        ref="exampleFormRef"
        label-width="100px"
        :model="exampleForm"
        :rules="exampleRules"
      >
        <el-form-item
          label="产品包名"
          prop="pkg"
        >
          <el-input
            v-model.trim="exampleForm.pkg"
            clearable
            placeholder="请输入产品包名"
          />
        </el-form-item>
        <el-form-item
          label="示例名称"
          prop="exampleName"
        >
          <el-input
            v-model.trim="exampleForm.exampleName"
            clearable
            placeholder="请输入示例名称"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-radio-group v-model="exampleForm.status">
            <el-radio
              v-for="opt in $MAPS.example.simpleExample.exampleStatus.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="confirmEditSimpleExample"
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

import { requestEditSimpleExample } from '@/modules/_example/simpleExample/_api';
import { EXAMPLE_STATUS_ENABLED } from '@/modules/_example/simpleExample/_map/exampleStatus';

const emit = defineEmits<{
  success: [];
}>();

const dialogVisible = ref(false);
const pageLoading = ref(false);
const submitLoading = ref(false);
const exampleFormRef = ref<FormInstance>();

const exampleForm = reactive({
  id: '' as string | number,
  pkg: '',
  exampleName: '',
  status: EXAMPLE_STATUS_ENABLED,
});

const exampleRules: FormRules = {
  pkg: [{ required: true, message: '请输入产品包名', trigger: 'blur' }],
  exampleName: [{ required: true, message: '请输入示例名称', trigger: 'blur' }],
};

const isEdit = computed(() => !!exampleForm.id);

function resetEditSimpleExample() {
  exampleForm.id = '';
  exampleForm.pkg = '';
  exampleForm.exampleName = '';
  exampleForm.status = EXAMPLE_STATUS_ENABLED;
  exampleFormRef.value?.clearValidate();
}

function open(row?: { id: number; pkg: string; exampleName: string; status: number }) {
  resetEditSimpleExample();
  if (row) {
    exampleForm.id = row.id;
    exampleForm.pkg = row.pkg;
    exampleForm.exampleName = row.exampleName;
    exampleForm.status = row.status;
  }
  dialogVisible.value = true;
  pageLoading.value = true;
  window.setTimeout(() => {
    pageLoading.value = false;
  }, 120);
}

async function confirmEditSimpleExample() {
  await exampleFormRef.value?.validate();
  submitLoading.value = true;
  try {
    await requestEditSimpleExample({
      id: exampleForm.id || undefined,
      exampleName: exampleForm.exampleName,
      status: exampleForm.status,
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
