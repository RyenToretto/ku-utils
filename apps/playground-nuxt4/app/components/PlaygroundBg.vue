<template>
  <div
    ref="rootRef"
    class="pg-bg"
    aria-hidden="true"
  >
    <div class="pg-bg-track">
      <img
        v-for="(src, index) in slides"
        :key="`${src}-${index}`"
        class="pg-bg-slide"
        :src="src"
        alt=""
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PlaygroundBg' });

const IMAGES = ['/bg/1.png', '/bg/2.png', '/bg/3.png', '/bg/4.png', '/bg/5.png'];

const rootRef = ref<HTMLElement | null>(null);
const slideCount = ref(IMAGES.length);
const slides = computed(() =>
  Array.from({ length: slideCount.value }, (_, index) => IMAGES[index % IMAGES.length]),
);

let resizeObserver: ResizeObserver | null = null;

function syncSlideCount() {
  const page = rootRef.value?.closest('.pg-root');
  const shell = page?.querySelector('.pg-shell');
  const vh = window.innerHeight || 1;
  const shellHeight = shell instanceof HTMLElement ? shell.offsetHeight : 0;
  slideCount.value = Math.max(IMAGES.length, Math.ceil(shellHeight / vh));
}

onMounted(() => {
  const page = rootRef.value?.closest('.pg-root');
  syncSlideCount();
  if (!page || typeof ResizeObserver === 'undefined') return;
  resizeObserver = new ResizeObserver(syncSlideCount);
  resizeObserver.observe(page);
  window.addEventListener('resize', syncSlideCount);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', syncSlideCount);
});
</script>
