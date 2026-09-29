<template>
  <div class="page-ui-kit-words-tag">
    <PageHeader subtitle="侧栏推荐与行内推荐两种布局；max / tagLength 约束。" />

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>侧栏推荐</h3>
      <DoWordsTag
        v-model="asideTags"
        :max="6"
        :tag-length="12"
        :recommends="recommendList"
        recommend-layout="aside"
      />
      <p class="ui-kit-demo-hint">{{ asideTags.join(' / ') || '—' }}</p>
    </el-card>

    <el-card
      shadow="never"
      class="ui-kit-demo-card"
    >
      <h3>行内推荐</h3>
      <DoWordsTag
        v-model="inlineTags"
        tips-main="可从推荐词快速添加；超出长度会截断提示。"
        :max="5"
        :tag-length="16"
        :recommends="recommendList"
        recommend-layout="inline"
      />
      <p class="ui-kit-demo-hint">{{ inlineTags.join(' / ') || '—' }}</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const recommendList = ['新品', '促销', '高转化', '品牌词'];

const asideTags = ref<string[]>(['新品']);
const inlineTags = ref<string[]>([]);
</script>

<style lang="scss" scoped>
.page-ui-kit-words-tag {
  box-sizing: border-box;
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
