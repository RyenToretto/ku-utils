import { createXhReport } from '@ku-utils/report';

const REPORT_URL = 'https://xr.crplt.com/adtrack';
const ATTR_URL = 'https://xe.xdplt.com/adtrack';
const REPORT_STORAGE_PREFIX = '__ku_utils_report';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class ReportDemoController {
  constructor(onChange) {
    this.onChange = onChange;
    this.tracker = null;
    this.token = 'vue2-user-1';
    this.orderId = 'vue2-order-1';
    this.sequence = 1;
    this.logSequence = 1;
    this.requests = [];
    this.activities = [];
    this.publish();
  }

  snapshot() {
    return {
      activities: [...this.activities],
      orderId: this.orderId,
      queueKeys: this.readQueueKeys(),
      requests: this.requests.map((request) => ({ ...request, body: [...request.body] })),
      token: this.token,
    };
  }

  async initialize() {
    if (!this.tracker) this.tracker = this.createTracker(this.token);
    this.addRequestLog(['xh_alive', 'xh_heartbeat', 'xh_start'], 'report', [
      { note: 'createXhReport 自动初始化的生命周期事件' },
    ]);
    await delay(300);
    this.addActivity(`createXhReport 已自动初始化 ${this.token}（isDev=false，manual 未传）`);
  }

  async simulatePaymentWithFreshAlive() {
    this.token = `vue2-pay-user-${this.sequence}`;
    this.orderId = `vue2-order-${Date.now()}-${this.sequence++}`;
    const paymentBody = { amount: 19.9, currency: 'CNY', orderId: this.orderId };
    const tracker = this.createTracker(this.token);
    const log = this.addRequestLog(['xh_alive', 'pay_suc'], 'report', [paymentBody]);
    const payment = tracker('pay_suc', paymentBody, { dedupeKey: this.orderId });
    await this.settle(log, payment);
    this.tracker = tracker;
    this.addActivity(`支付 ${this.orderId} 已调用；Network 中同身份应先出现 xh_alive`);
  }

  async queueBeforeInit() {
    this.token = `vue2-preinit-${this.sequence}`;
    const tracker = this.createTracker(this.token);
    const keys = ['preinit_view', 'preinit_click', 'preinit_submit'];
    const log = this.addRequestLog(
      ['xh_alive', ...keys],
      'report',
      keys.map((key) => ({ key })),
    );
    const queued = keys.map((key, index) => tracker(key, { index: index + 1 }));
    await this.settle(log, Promise.all(queued));
    this.tracker = tracker;
    this.addActivity('createXhReport 后同一 tick 调用 3 条事件，验证自动初始化与 alive 排序');
  }

  async burst(count = 40) {
    await this.ensureTracker();
    const keys = Array.from(
      { length: count },
      (_, index) => `pool_event_${String(index + 1).padStart(2, '0')}`,
    );
    const log = this.addRequestLog(
      keys,
      'report',
      keys.map((key, index) => ({ index, key })),
    );
    const calls = keys.map((key, index) => this.tracker(key, { index }));
    await this.settle(log, Promise.all(calls));
    this.addActivity(`${count} 条事件已提交；Network 中应按 FIFO 拆为不超过 20 条的批次`);
  }

  async retryAfterFailure() {
    window.dispatchEvent(new Event('online'));
    const log = this.addRequestLog(['online'], 'recovery', [
      { note: '手动触发浏览器 online 恢复事件池' },
    ]);
    await delay(1_000);
    log.status = 'queued';
    this.publish();
    this.addActivity('已触发 online；请通过 Network 与持久化键确认离线事件是否补发');
  }

  async enqueueRecoveryProbe() {
    await this.ensureTracker();
    const key = `recovery_probe_${this.sequence++}`;
    const log = this.addRequestLog([key], 'report', [{ scenario: 'offline-recovery' }]);
    await this.settle(log, this.tracker(key, { scenario: 'offline-recovery' }));
    this.addActivity(
      log.status === 'failed'
        ? `${key} 首次请求失败并保留在事件池；现在恢复网络后点击 online`
        : `${key} 已成功；要验证恢复流程，请先在 DevTools 切换 Offline`,
    );
  }

  async switchToken() {
    this.token = `vue2-user-${++this.sequence}`;
    this.tracker = this.createTracker(this.token);
    this.addRequestLog(['xh_alive', 'xh_heartbeat', 'xh_start'], 'report', [
      { note: '新 token 自动生命周期事件' },
    ]);
    await delay(300);
    this.addActivity(`已通过新的 createXhReport 切换到 ${this.token}，应补发新身份 alive`);
  }

  async verifyDedupe() {
    await this.ensureTracker();
    const orderId = `vue2-dedupe-${this.sequence++}`;
    const log = this.addRequestLog(['pay_suc', 'pay_suc'], 'report', [{ orderId }]);
    try {
      const first = await this.tracker('pay_suc', { orderId }, { dedupeKey: orderId });
      const second = await this.tracker('pay_suc', { orderId }, { dedupeKey: orderId });
      log.status = second === -1 ? 'skipped' : 'success';
      this.addActivity(`同订单首次=${String(first)}, 第二次=${String(second)}（预期 -1）`);
    } catch (error) {
      this.fail(log, error);
    }
  }

  async reportAttribute() {
    await this.ensureTracker();
    const key = `demo_profile_${this.sequence++}`;
    const body = { level: 'gold', source: 'playground-vue2' };
    const log = this.addRequestLog([key], 'attr', [body]);
    await this.settle(log, this.tracker.attrReport(key, body));
    this.addActivity(`属性事件 ${key} 已请求 ${ATTR_URL}`);
  }

  clearReportStorage() {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(REPORT_STORAGE_PREFIX)) localStorage.removeItem(key);
    }
    this.addActivity('已清除 report 持久化记录；当前页面内存中的待发事件不受影响');
  }

  clearLogs() {
    this.requests.splice(0);
    this.activities.splice(0);
    this.publish();
  }

  createTracker(token) {
    return createXhReport({
      attrUrl: ATTR_URL,
      isDev: false,
      pkg: 'com.ku-utils.playground-vue2.demo',
      reportUrl: REPORT_URL,
      tk: token,
      version: '1.0.1',
    });
  }

  async ensureTracker() {
    if (!this.tracker) await this.initialize();
  }

  addRequestLog(keys, channel, body) {
    const log = {
      body,
      channel,
      createdAt: new Date().toLocaleTimeString(),
      endpoint: channel === 'attr' ? ATTR_URL : REPORT_URL,
      id: this.logSequence++,
      keys,
      status: 'queued',
      token: this.token,
    };
    this.requests.unshift(log);
    this.publish();
    return log;
  }

  async settle(log, request) {
    try {
      await request;
      log.status = 'success';
    } catch (error) {
      this.fail(log, error);
    }
    this.publish();
  }

  fail(log, error) {
    log.status = 'failed';
    log.error = error instanceof Error ? error.message : String(error);
    this.publish();
  }

  addActivity(message) {
    this.activities.unshift(`${new Date().toLocaleTimeString()} ${message}`);
    this.publish();
  }

  readQueueKeys() {
    const keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith('__ku_utils_report_pool__') && key.includes(':record:')) keys.push(key);
    }
    return keys.sort();
  }

  publish() {
    this.onChange(this.snapshot());
  }
}
