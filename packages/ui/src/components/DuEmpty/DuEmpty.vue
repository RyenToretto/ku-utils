<template>
  <div class="du-empty">
    <div class="du-empty-image">
      <img
        v-if="image"
        :src="image"
        alt="empty"
      />
      <svg
        v-else
        viewBox="0 0 64 41"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          transform="translate(0 1)"
          fill="none"
          fill-rule="evenodd"
        >
          <ellipse
            fill="#f5f5f5"
            cx="32"
            cy="33"
            rx="32"
            ry="7"
          />
          <g
            fill-rule="nonzero"
            stroke="#d9d9d9"
          >
            <!-- eslint-disable @stylistic/max-len -->
            <path
              d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"
            />
            <path
              d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
              fill="#fafafa"
            />
            <!-- eslint-enable @stylistic/max-len -->
          </g>
        </g>
      </svg>
    </div>
    <p class="du-empty-description">
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="du-empty-footer"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DuEmpty' });

withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  image: undefined,
});

interface Props {
  description?: string;
  image?: string;
}
</script>

<style>
.du-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--ku-space-8);
}

.du-empty-image svg,
.du-empty-image img {
  width: 64px;
  height: 41px;
}

.du-empty-description {
  color: var(--ku-text-placeholder);
  font-size: var(--ku-font-size-sm);
  margin-top: var(--ku-space-2);
}

.du-empty-footer {
  margin-top: var(--ku-space-4);
}
</style>
