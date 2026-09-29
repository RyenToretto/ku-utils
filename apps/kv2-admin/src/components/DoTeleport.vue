<template>
  <div
    v-show="false"
    ref="placeholder"
  />
</template>

<script setup lang="ts">
/**
 * Vue 2 无 Teleport；用手动挂载到 body（或 to 选择器）近似替代。
 * `string | HTMLElement` 会编成 type:[String,null]，须运行时 props（eslint 例外）。
 */
import Vue, {
  onBeforeUnmount,
  onMounted,
  ref,
  useSlots,
  watch,
  nextTick,
  type PropType,
} from 'vue';

// eslint-disable-next-line vue/define-props-declaration -- HTMLElement 无法用 type-based props（会编成 null）
const props = defineProps({
  to: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  disabled: { type: Boolean, default: false },
});

const slots = useSlots();
const placeholder = ref<HTMLElement>();
let host: HTMLElement | null = null;
let childVm: Vue | null = null;

function resolveTarget(): HTMLElement | null {
  if (props.disabled) return null;
  if (typeof props.to === 'string') {
    return document.querySelector(props.to);
  }
  return props.to || null;
}

function mountSlot() {
  unmountSlot();
  const target = resolveTarget();
  if (!target || !slots.default) return;
  host = document.createElement('div');
  host.className = 'do-teleport-host';
  target.appendChild(host);
  const vnodeFactory = slots.default;
  childVm = new Vue({
    parent: (placeholder.value as unknown as { __vueParentComponent?: { proxy?: Vue } })
      ? undefined
      : undefined,
    render(h) {
      const nodes = vnodeFactory?.({}) || [];
      return h('div', { class: 'do-teleport-inner' }, Array.isArray(nodes) ? nodes : [nodes]);
    },
  });
  childVm.$mount();
  host.appendChild(childVm.$el);
}

function unmountSlot() {
  if (childVm) {
    childVm.$destroy();
    childVm = null;
  }
  if (host?.parentNode) {
    host.parentNode.removeChild(host);
  }
  host = null;
}

onMounted(() => {
  nextTick(mountSlot);
});

watch(
  () => [props.to, props.disabled],
  () => nextTick(mountSlot),
);

onBeforeUnmount(unmountSlot);
</script>
