import { createXhReport, type TrackerInstance } from '@ku-utils/report';

export interface DemoRequestLog {
  id: number;
  token: string;
  channel: 'report' | 'attr' | 'recovery';
  endpoint: string;
  keys: string[];
  body: unknown[];
  status: 'queued' | 'success' | 'failed' | 'skipped';
  createdAt: string;
  error?: string;
}

export interface DemoSnapshot {
  token: string;
  orderId: string;
  requests: DemoRequestLog[];
  activities: string[];
  queueKeys: string[];
}

const REPORT_URL = 'https://xr.crplt.com/adtrack';
const ATTR_URL = 'https://xe.xdplt.com/adtrack';
const REPORT_STORAGE_PREFIX = '__ku_utils_report';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ReportDemoController {
  private tracker: TrackerInstance | null = null;
  private token = 'vue3-user-1';
  private orderId = 'vue3-order-1';
  private sequence = 1;
  private logSequence = 1;
  private readonly requests: DemoRequestLog[] = [];
  private readonly activities: string[] = [];

  constructor(private readonly onChange: (snapshot: DemoSnapshot) => void) {
    this.publish();
  }

  snapshot(): DemoSnapshot {
    return {
      activities: [...this.activities],
      orderId: this.orderId,
      queueKeys: this.readQueueKeys(),
      requests: this.requests.map((request) => ({ ...request, body: [...request.body] })),
      token: this.token,
    };
  }

  async initialize(): Promise<void> {
    if (!this.tracker) this.tracker = this.createTracker(this.token);
    const log = this.addRequestLog(['xh_alive', 'xh_heartbeat', 'xh_start'], 'report', [
      { note: 'createXhReport 自动初始化的生命周期事件' },
    ]);
    await delay(300);
    log.status = 'queued';
    this.addActivity(`createXhReport 已自动初始化 ${this.token}（isDev=false，manual 未传）`);
  }

  async simulatePaymentWithFreshAlive(): Promise<void> {
    this.token = `vue3-pay-user-${this.sequence}`;
    this.orderId = `vue3-order-${Date.now()}-${this.sequence++}`;
    const paymentBody = { amount: 19.9, currency: 'CNY', orderId: this.orderId };
    const tracker = this.createTracker(this.token);
    const log = this.addRequestLog(['xh_alive', 'pay_suc'], 'report', [paymentBody]);
    const payment = tracker('pay_suc', paymentBody, { dedupeKey: this.orderId });
    await this.settle(log, payment);
    this.tracker = tracker;
    this.addActivity(`支付 ${this.orderId} 已调用；Network 中同身份应先出现 xh_alive`);
  }

  async queueBeforeInit(): Promise<void> {
    this.token = `vue3-preinit-${this.sequence}`;
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

  async burst(count = 40): Promise<void> {
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
    const calls = keys.map((key, index) => this.tracker?.(key, { index }));
    await this.settle(log, Promise.all(calls));
    this.addActivity(`${count} 条事件已提交；Network 中应按 FIFO 拆为不超过 20 条的批次`);
  }

  async retryAfterFailure(): Promise<void> {
    window.dispatchEvent(new Event('online'));
    const log = this.addRequestLog(['online'], 'recovery', [
      { note: '手动触发浏览器 online 恢复事件池' },
    ]);
    await delay(1_000);
    log.status = 'queued';
    this.publish();
    this.addActivity('已触发 online；请通过 Network 与持久化键确认离线事件是否补发');
  }

  async enqueueRecoveryProbe(): Promise<void> {
    await this.ensureTracker();
    const key = `recovery_probe_${this.sequence++}`;
    const log = this.addRequestLog([key], 'report', [{ scenario: 'offline-recovery' }]);
    await this.settle(log, this.tracker?.(key, { scenario: 'offline-recovery' }));
    this.addActivity(
      log.status === 'failed'
        ? `${key} 首次请求失败并保留在事件池；现在恢复网络后点击 online`
        : `${key} 已成功；要验证恢复流程，请先在 DevTools 切换 Offline`,
    );
  }

  async switchToken(): Promise<void> {
    this.token = `vue3-user-${++this.sequence}`;
    this.tracker = this.createTracker(this.token);
    const log = this.addRequestLog(['xh_alive', 'xh_heartbeat', 'xh_start'], 'report', [
      { note: '新 token 自动生命周期事件' },
    ]);
    await delay(300);
    log.status = 'queued';
    this.addActivity(`已通过新的 createXhReport 切换到 ${this.token}，应补发新身份 alive`);
  }

  async verifyDedupe(): Promise<void> {
    await this.ensureTracker();
    const orderId = `vue3-dedupe-${this.sequence++}`;
    const log = this.addRequestLog(['pay_suc', 'pay_suc'], 'report', [{ orderId }]);
    try {
      const first = await this.tracker?.('pay_suc', { orderId }, { dedupeKey: orderId });
      const second = await this.tracker?.('pay_suc', { orderId }, { dedupeKey: orderId });
      log.status = second === -1 ? 'skipped' : 'success';
      this.addActivity(`同订单首次=${String(first)}, 第二次=${String(second)}（预期 -1）`);
    } catch (error) {
      this.fail(log, error);
    }
  }

  async reportAttribute(): Promise<void> {
    await this.ensureTracker();
    const key = `demo_profile_${this.sequence++}`;
    const body = { level: 'gold', source: 'playground-vue3' };
    const log = this.addRequestLog([key], 'attr', [body]);
    await this.settle(log, this.tracker?.attrReport(key, body));
    this.addActivity(`属性事件 ${key} 已请求 ${ATTR_URL}`);
  }

  clearReportStorage(): void {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(REPORT_STORAGE_PREFIX)) localStorage.removeItem(key);
    }
    this.addActivity('已清除 report 持久化记录；当前页面内存中的待发事件不受影响');
  }

  clearLogs(): void {
    this.requests.splice(0);
    this.activities.splice(0);
    this.publish();
  }

  private createTracker(token: string): TrackerInstance {
    return createXhReport({
      attrUrl: ATTR_URL,
      isDev: false,
      pkg: 'com.ku-utils.playground-vue3.demo',
      reportUrl: REPORT_URL,
      tk: token,
      version: '1.0.1',
    });
  }

  private async ensureTracker(): Promise<void> {
    if (!this.tracker) await this.initialize();
  }

  private addRequestLog(
    keys: string[],
    channel: DemoRequestLog['channel'],
    body: unknown[],
  ): DemoRequestLog {
    const log: DemoRequestLog = {
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

  private async settle(log: DemoRequestLog, request: Promise<unknown> | undefined): Promise<void> {
    try {
      await request;
      log.status = 'success';
    } catch (error) {
      this.fail(log, error);
    }
    this.publish();
  }

  private fail(log: DemoRequestLog, error: unknown): void {
    log.status = 'failed';
    log.error = error instanceof Error ? error.message : String(error);
    this.publish();
  }

  private addActivity(message: string): void {
    this.activities.unshift(`${new Date().toLocaleTimeString()} ${message}`);
    this.publish();
  }

  private readQueueKeys(): string[] {
    const keys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith('__ku_utils_report_pool__') && key.includes(':record:')) keys.push(key);
    }
    return keys.sort();
  }

  private publish(): void {
    this.onChange(this.snapshot());
  }
}
