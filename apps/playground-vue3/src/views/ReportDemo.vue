<template>
  <main class="report-demo">
    <header class="hero">
      <RouterLink
        class="back-link"
        to="/"
      >
        ← 返回首页
      </RouterLink>
      <p class="brand">DO POWER / REPORT LAB</p>
      <h2>支付上报与事件池可靠性验证</h2>
      <p>
        使用
        <code>createXhReport</code>
        自动初始化并请求真实上报端点，观察 alive 屏障、FIFO
        分批、双通道、失败恢复与身份隔离。测试使用假 pkg，服务端会忽略业务数据。
      </p>
      <div class="identity">
        <span>当前 token：{{ snapshot.token }}</span>
        <span>最近订单：{{ snapshot.orderId }}</span>
      </div>
    </header>

    <section class="scenario-section">
      <div class="section-heading">
        <div>
          <p class="section-index">01 / 场景控制</p>
          <h3>构造关键时序</h3>
        </div>
        <span
          v-if="busy"
          class="running"
        >
          场景执行中…
        </span>
      </div>
      <div class="actions">
        <button
          class="primary"
          :disabled="busy"
          @click="run(controller.simulatePaymentWithFreshAlive)"
        >
          模拟支付 + Fresh Alive
        </button>
        <button
          :disabled="busy"
          @click="run(controller.queueBeforeInit)"
        >
          自动初始化同 Tick 入池
        </button>
        <button
          :disabled="busy"
          @click="run(() => controller.burst(40))"
        >
          批量构造 40 条事件
        </button>
        <button
          :disabled="busy"
          @click="run(controller.enqueueRecoveryProbe)"
        >
          离线入队恢复事件
        </button>
        <button
          :disabled="busy"
          @click="run(controller.retryAfterFailure)"
        >
          触发 online 恢复
        </button>
        <button
          :disabled="busy"
          @click="run(controller.switchToken)"
        >
          切换 Token
        </button>
        <button
          :disabled="busy"
          @click="run(controller.verifyDedupe)"
        >
          支付去重
        </button>
        <button
          :disabled="busy"
          @click="run(controller.reportAttribute)"
        >
          属性通道上报
        </button>
        <button
          :disabled="busy"
          @click="controller.clearReportStorage"
        >
          清空持久化记录
        </button>
        <button
          :disabled="busy"
          @click="controller.clearLogs"
        >
          清空日志
        </button>
      </div>
    </section>

    <section class="request-section">
      <div class="section-heading">
        <div>
          <p class="section-index">02 / SDK 调用</p>
          <h3>请求结果与事件序列</h3>
        </div>
        <strong>{{ snapshot.requests.length }} scenarios</strong>
      </div>

      <p
        v-if="!snapshot.requests.length"
        class="empty"
      >
        尚无请求。实际 HTTP 批次请同时查看浏览器 Network 面板。
      </p>
      <article
        v-for="request in snapshot.requests"
        :key="request.id"
        class="request-row"
      >
        <div class="request-meta">
          <span
            class="status"
            :class="request.status"
          >
            {{ request.status }}
          </span>
          <time>{{ request.createdAt }}</time>
          <strong>{{ request.channel }}</strong>
          <code>{{ request.token }}</code>
          <strong>{{ request.keys.length }} events</strong>
        </div>
        <code class="endpoint">{{ request.endpoint }}</code>
        <ol class="event-flow">
          <li
            v-for="(key, index) in request.keys"
            :key="`${request.id}-${index}`"
          >
            <span>{{ index }}</span>
            {{ key }}
          </li>
        </ol>
        <p
          v-if="request.error"
          class="error"
        >
          {{ request.error }}
        </p>
      </article>
    </section>

    <section class="diagnostics">
      <div>
        <p class="section-index">03 / 持久化</p>
        <h3>事件池记录</h3>
        <code v-if="snapshot.queueKeys.length">{{ snapshot.queueKeys.join('\n') }}</code>
        <p
          v-else
          class="empty"
        >
          当前没有待发送的持久化事件。
        </p>
      </div>
      <div>
        <p class="section-index">04 / 场景结果</p>
        <h3>操作日志</h3>
        <ul>
          <li
            v-for="activity in snapshot.activities"
            :key="activity"
          >
            {{ activity }}
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { ReportDemoController, type DemoSnapshot } from '@/report/demoTracker';

const snapshot = ref<DemoSnapshot>({
  activities: [],
  orderId: '',
  queueKeys: [],
  requests: [],
  token: '',
});
const busy = ref(false);
const controller = new ReportDemoController((nextSnapshot) => {
  snapshot.value = nextSnapshot;
});

async function run(action: () => Promise<void>): Promise<void> {
  busy.value = true;
  try {
    await action.call(controller);
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  void run(controller.initialize);
});
</script>

<style scoped>
.report-demo {
  --ink: #102d35;
  --muted: #527078;
  --line: #b8ced0;
  --accent: #007f77;
  --accent-dark: #005b56;
  color: var(--ink);
}

.hero {
  padding: 1rem 0 2rem;
  border-bottom: 2px solid var(--ink);
  background:
    radial-gradient(circle at 85% 12%, rgb(0 127 119 / 16%), transparent 34%),
    linear-gradient(115deg, #effafa 0%, #fff 62%);
}

.back-link {
  color: var(--accent-dark);
}

.brand,
.section-index {
  margin: 1.5rem 0 0.35rem;
  color: var(--accent);
  font:
    700 0.75rem/1.2 'Avenir Next Condensed',
    'DIN Condensed',
    sans-serif;
  letter-spacing: 0.14em;
}

h2 {
  max-width: 680px;
  margin: 0;
  font:
    700 clamp(2rem, 6vw, 4rem) / 0.98 'Avenir Next',
    'Trebuchet MS',
    sans-serif;
  letter-spacing: -0.05em;
}

h3 {
  margin: 0;
  font-size: 1.35rem;
}

.hero > p:not(.brand) {
  max-width: 650px;
  color: var(--muted);
}

.identity {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  margin-top: 1.25rem;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.8rem;
}

section {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--line);
}

.section-heading,
.request-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-index {
  margin-top: 0;
}

.running {
  color: var(--accent);
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}

button {
  min-height: 44px;
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--ink);
  background: #fff;
  color: var(--ink);
  cursor: pointer;
  font:
    650 0.85rem/1.2 'Avenir Next',
    sans-serif;
  text-align: left;
}

button:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent-dark);
  transform: translateY(-1px);
}

button.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

button:disabled {
  cursor: wait;
  opacity: 0.45;
}

.request-row {
  padding: 1rem 0;
  border-top: 1px solid var(--line);
}

.request-row:first-of-type {
  margin-top: 1rem;
}

.request-meta {
  justify-content: flex-start;
  color: var(--muted);
  font-size: 0.78rem;
}

.status {
  min-width: 52px;
  color: var(--accent-dark);
  font-weight: 750;
  text-transform: uppercase;
}

.status.failed,
.error {
  color: #a33a22;
}

.event-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.78rem;
}

.event-flow li {
  display: flex;
  gap: 0.35rem;
}

.event-flow span {
  color: var(--accent);
}

.diagnostics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.diagnostics code {
  display: block;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.diagnostics ul {
  padding-left: 1.2rem;
  color: var(--muted);
}

.empty {
  color: var(--muted);
}

@media (max-width: 640px) {
  .diagnostics {
    grid-template-columns: 1fr;
  }

  .request-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
