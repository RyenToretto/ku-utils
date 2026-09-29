<template>
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
      <router-view />
    </div>
    <DialogPreviewVideo ref="previewVideoRef" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import DialogPreviewVideo from '@/components/DialogPreviewVideo.vue';
import { useSplashReadiness } from '@/composables/useSplashReadiness';
import BaseHeader from '@/layouts/BaseHeader.vue';
import { useVersionUpdate } from '@/lib/useVersionUpdate';
import { routerReady } from '@/router';
import { useRoute } from '@/shims/vue-router-composables';
import { registerPreviewVideoHost } from '@/utils/previewMedia';
import { fetchStaticVersion } from '@/utils/version';

const route = useRoute();
const previewVideoRef = ref<InstanceType<typeof DialogPreviewVideo> | null>(null);

const { waitForRouterReady } = useSplashReadiness(() => routerReady());

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
