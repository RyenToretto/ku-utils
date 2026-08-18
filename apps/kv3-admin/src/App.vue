<template>
  <el-config-provider :locale="zhCn">
    <div
      class="app-entry"
      :class="{
        'hide-header': route.meta.hideHeader,
      }"
    >
      <BaseHeader
        v-if="!route.meta.hideHeader"
        :has-update="hasUpdate"
        @refresh="refreshForUpdate"
      />
      <div class="app-shell-main">
        <RouterView />
      </div>
      <DialogPreviewVideo ref="previewVideoRef" />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useVersionUpdate } from '@ku-utils/hooks';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import DialogPreviewVideo from '@/components/DialogPreviewVideo.vue';
import { useSplashReadiness } from '@/composables/useSplashReadiness';
import BaseHeader from '@/layouts/BaseHeader.vue';
import router from '@/router';
import { registerPreviewVideoHost } from '@/utils/previewMedia';
import { fetchStaticVersion } from '@/utils/version';

const route = useRoute();
const previewVideoRef = ref<InstanceType<typeof DialogPreviewVideo> | null>(null);

const { waitForRouterReady } = useSplashReadiness(() => router.isReady());

const { hasUpdate, refreshForUpdate } = useVersionUpdate({
  fetchVersion: fetchStaticVersion,
  getVersionId: (version) => `${version.version}:${version.versionTimeISO}`,
  getVersionTime: (version) => `${version.version}:${version.versionTime}`,
});

watch(
  previewVideoRef,
  (host) => {
    registerPreviewVideoHost(host ? { play: (url, raw) => host.play(url, raw) } : null);
  },
  { immediate: true },
);

onMounted(waitForRouterReady);

onBeforeUnmount(() => {
  registerPreviewVideoHost(null);
});
</script>

<style lang="scss">
.app-entry {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
  background: var(--ku-bg-page-gradient, var(--ku-bg-page));
}

.app-shell-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.hide-header .base-header {
  display: none;
}
</style>
