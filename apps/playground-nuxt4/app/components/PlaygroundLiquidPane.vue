<template>
  <aside class="pg-liquid-pane">
    <DuLiquidGlass
      class="pg-liquid-bar"
      filter-id="pg-n4-liq-header"
      radius="var(--ku-radius-md)"
      :tint="glassTint"
    >
      <div class="pg-liquid-bar-inner">液态 header</div>
    </DuLiquidGlass>

    <DuLiquidFloatingBar
      class="pg-liquid-pill"
      glass-id="pg-n4-liq-nav-top"
      placement="static"
      :sticky="false"
      :force-condensed="true"
      condensed-width="100%"
      condensed-height="48px"
      condensed-margin="0"
      :tint="glassTint"
    >
      <div class="pg-liquid-nav-row">
        <span>首页</span>
        <span>组件</span>
        <span>文档</span>
      </div>
    </DuLiquidFloatingBar>

    <div class="pg-liquid-stage">
      <DuLiquidGlass
        class="pg-liquid-card"
        filter-id="pg-n4-liq-card"
        radius="var(--ku-radius-xl)"
        :tint="glassTint"
      >
        <div class="pg-liquid-card-body">
          <p class="pg-liquid-scene-kicker">液态卡片</p>
          <p class="pg-liquid-scene-copy">独立 DuLiquidGlass，无外层底色。</p>
        </div>
      </DuLiquidGlass>
    </div>

    <DuLiquidFloatingBar
      class="pg-liquid-pill"
      glass-id="pg-n4-liq-nav-bottom"
      placement="static"
      :sticky="false"
      :force-condensed="true"
      condensed-width="100%"
      condensed-height="48px"
      condensed-margin="0"
      :tint="glassTint"
    >
      <div class="pg-liquid-nav-row">
        <span>发现</span>
        <span>消息</span>
        <span>我的</span>
      </div>
    </DuLiquidFloatingBar>

    <DuLiquidGlass
      class="pg-liquid-bar"
      filter-id="pg-n4-liq-footer"
      radius="var(--ku-radius-md)"
      :tint="glassTint"
    >
      <div class="pg-liquid-bar-inner">液态 footer</div>
    </DuLiquidGlass>
  </aside>
</template>

<script setup lang="ts">
defineOptions({ name: 'PlaygroundLiquidPane' });

const glassTint = 'color-mix(in srgb, var(--ku-bg-card, #ffffff) 32%, transparent)';
</script>
