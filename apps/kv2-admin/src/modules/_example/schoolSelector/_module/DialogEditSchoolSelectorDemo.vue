<template>
  <div class="dialog-edit-school-selector-demo-host">
    <el-dialog
      :visible.sync="dialogVisible"
      class="dialog-edit-school-selector-demo"
      width="640px"
      append-to-body
      destroy-on-close
      @closed="resetDemoForm"
    >
      <template #title>
        <span class="el-dialog__title">
          {{ isEdit ? '编辑演示' : '新建演示' }}
          <span
            v-if="isEdit"
            class="dialog-edit-school-selector-demo-tips"
          >
            （验证选择器回填）
          </span>
        </span>
      </template>

      <div class="do-dialog-content-box">
        <el-form
          ref="demoFormRef"
          label-width="120px"
          :model="demoForm"
          :rules="demoRules"
        >
          <el-form-item
            label="演示名称"
            prop="demoName"
            class="is-required"
          >
            <el-input
              v-model.trim="demoForm.demoName"
              clearable
              placeholder="请输入演示名称"
            />
          </el-form-item>
          <el-form-item
            label="学校（单选）"
            prop="schoolSingle"
            class="is-required"
          >
            <SchoolSelector v-model="demoForm.schoolSingle" />
          </el-form-item>
          <el-form-item label="学校（多选）">
            <SchoolSelector
              v-model="demoForm.schoolMulti"
              multiple
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="confirmDemoForm"
        >
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Message as ElMessage } from 'element-ui';
import { computed, reactive, ref } from 'vue';

import SchoolSelector from '@/modules/_example/schoolResource/_module/SchoolSelector.vue';
import type { SchoolSelectorValue } from '@/modules/_example/schoolResource/_module/types';
import type { FormInstance, FormRules } from '@/types/element-ui-form';

type DemoFormState = {
  id: string;
  demoName: string;
  schoolSingle: SchoolSelectorValue | null;
  schoolMulti: SchoolSelectorValue[];
};

const emit = defineEmits<{
  success: [payload: DemoFormState];
}>();

const dialogVisible = ref(false);
const demoFormRef = ref<FormInstance>();

const demoForm = reactive<DemoFormState>({
  id: '',
  demoName: '',
  schoolSingle: null,
  schoolMulti: [],
});

const demoRules: FormRules = {
  demoName: [{ required: true, message: '请输入演示名称', trigger: 'blur' }],
  schoolSingle: [
    {
      validator: (_rule, value, callback) => {
        if (!value) callback(new Error('请选择学校'));
        else callback();
      },
      trigger: 'change',
    },
  ],
};

const isEdit = computed(() => !!demoForm.id);

function resetDemoForm() {
  demoForm.id = '';
  demoForm.demoName = '';
  demoForm.schoolSingle = null;
  demoForm.schoolMulti = [];
  demoFormRef.value?.clearValidate();
}

function open(row?: Partial<DemoFormState>) {
  resetDemoForm();
  if (row) {
    demoForm.id = row.id || '';
    demoForm.demoName = row.demoName || '';
    demoForm.schoolSingle = row.schoolSingle || null;
    demoForm.schoolMulti = row.schoolMulti ? [...row.schoolMulti] : [];
  }
  dialogVisible.value = true;
}

async function confirmDemoForm() {
  await demoFormRef.value?.validate();
  emit('success', {
    id: demoForm.id,
    demoName: demoForm.demoName,
    schoolSingle: demoForm.schoolSingle,
    schoolMulti: [...demoForm.schoolMulti],
  });
  ElMessage.success(isEdit.value ? '编辑演示已确认' : '新建演示已确认');
  dialogVisible.value = false;
}

defineExpose({ open });
</script>

<style lang="scss" scoped>
.dialog-edit-school-selector-demo-host {
  display: contents;
}

.dialog-edit-school-selector-demo-tips {
  margin-left: 6px;
  color: var(--el-text-color-secondary);
  font-weight: 400;
  font-size: 13px;
}
</style>
