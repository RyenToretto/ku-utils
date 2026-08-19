<template>
  <aside class="pg-liquid-pane">
    <div class="pg-liquid-fake pg-liquid-bar">
      <div class="pg-liquid-bar-inner">液态 header</div>
    </div>
    <div class="pg-liquid-fake pg-liquid-pill">
      <div class="pg-liquid-nav-row">
        <span>首页</span>
        <span>组件</span>
        <span>文档</span>
      </div>
    </div>
    <div class="pg-liquid-stage">
      <div class="pg-liquid-fake pg-liquid-card">
        <div class="pg-liquid-card-body">
          <p class="pg-liquid-scene-kicker">液态卡片</p>
          <p class="pg-liquid-scene-copy">Vue 2 无 DuLiquidGlass，形状与 Vue 3 场景对齐。</p>
        </div>
      </div>
    </div>
    <div class="pg-liquid-fake pg-liquid-pill">
      <div class="pg-liquid-nav-row">
        <span>发现</span>
        <span>消息</span>
        <span>我的</span>
      </div>
    </div>
    <div class="pg-liquid-fake pg-liquid-bar">
      <div class="pg-liquid-bar-inner">液态 footer</div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'PlaygroundLiquidPane',
};
</script>
