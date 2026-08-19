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

<script>
const IMAGES = ['/bg/1.png', '/bg/2.png', '/bg/3.png', '/bg/4.png', '/bg/5.png'];

export default {
  name: 'PlaygroundBg',
  data() {
    return {
      slideCount: IMAGES.length,
      resizeObserver: null,
    };
  },
  computed: {
    slides() {
      return Array.from({ length: this.slideCount }, (_, index) => IMAGES[index % IMAGES.length]);
    },
  },
  mounted() {
    this.syncSlideCount();
    const page = this.$el.closest('.pg-root');
    if (page && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncSlideCount());
      this.resizeObserver.observe(page);
    }
    window.addEventListener('resize', this.syncSlideCount);
  },
  beforeUnmount() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('resize', this.syncSlideCount);
  },
  methods: {
    syncSlideCount() {
      const page = this.$el.closest('.pg-root');
      const shell = page && page.querySelector('.pg-shell');
      const vh = window.innerHeight || 1;
      const shellHeight = shell ? shell.offsetHeight : 0;
      this.slideCount = Math.max(IMAGES.length, Math.ceil(shellHeight / vh));
    },
  },
};
</script>
