/**
 * 通用日志工具
 * - 分级日志（DEBUG / INFO / WARN / ERROR / SILENT）
 * - 可选 Sentry 上报（动态 import，失败降级）
 * - 可选自定义 reporter
 * - 业务埋点 track 方法（含 Sentry breadcrumb）
 */

const isBrowser = typeof window !== 'undefined';

const levelNameMap = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
} as const;

type LoggerLevelName = keyof typeof levelNameMap;

type ConsoleLike = Pick<Console, 'log' | 'warn' | 'error'>;

interface SentryScopeLike {
  setContext?: (name: string, context: Record<string, unknown>) => void;
  setExtra?: (name: string, value: unknown) => void;
}

interface SentryLike {
  init?: (options: Record<string, unknown>) => void;
  setTag?: (name: string, value: string) => void;
  setContext?: (name: string, context: Record<string, unknown>) => void;
  withScope?: (cb: (scope: SentryScopeLike) => void) => void;
  captureException?: (error: unknown) => void;
  addBreadcrumb?: (breadcrumb: Record<string, unknown>) => void;
}

export interface LoggerEntry {
  level: LoggerLevelName;
  prefix: string;
  traceId: string;
  timestamp: string;
  args: unknown[];
}

export interface LoggerSentryOptions {
  enabled?: boolean;
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  importSentry?: () => Promise<unknown>;
}

export interface LoggerReporterOptions {
  enabled?: boolean;
  onReport?: (entry: LoggerEntry) => void | Promise<void>;
}

export interface LoggerOptions {
  prefix?: string;
  level?: number | LoggerLevelName;
  color?: string;
  enabled?: boolean;
  traceId?: string;
  console?: ConsoleLike;
  sentry?: LoggerSentryOptions;
  reporter?: LoggerReporterOptions;
  onLog?: (entry: LoggerEntry) => void;
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export class DoLogger {
  private loggerLevel: LogLevel;
  private prefix: string;
  private color: string;
  private enabled: boolean;
  private traceId: string;
  private readonly output: ConsoleLike;
  private readonly onLog?: (entry: LoggerEntry) => void;
  private readonly reporter?: LoggerReporterOptions;
  private readonly sentryOptions?: LoggerSentryOptions;
  private sentry: SentryLike | null = null;

  constructor(options: LoggerOptions = {}) {
    this.loggerLevel = this.normalizeLevel(options.level);
    this.prefix = options.prefix ?? 'App';
    this.color = options.color ?? '#edba81';
    this.enabled = options.enabled ?? true;
    this.traceId = options.traceId ?? this.generateTraceId();
    this.output = options.console ?? console;
    this.onLog = options.onLog;
    this.reporter = options.reporter;
    this.sentryOptions = options.sentry;
    void this.setupSentry();
  }

  private getEnv(): string {
    try {
      const env = (import.meta as { env?: { MODE?: string } } | undefined)?.env;
      if (env?.MODE) return env.MODE;
    } catch {
      // ignore
    }
    const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process;
    return proc?.env?.NODE_ENV || 'production';
  }

  private generateTraceId(): string {
    return (Date.now().toString(36) + Math.random().toString(36).slice(2)).toUpperCase();
  }

  private normalizeLevel(level?: number | LoggerLevelName): LogLevel {
    if (typeof level === 'number' && level >= LogLevel.DEBUG && level <= LogLevel.SILENT) {
      return level as LogLevel;
    }
    if (typeof level === 'string' && level in levelNameMap) {
      return levelNameMap[level as LoggerLevelName];
    }
    return LogLevel.INFO;
  }

  private async setupSentry(): Promise<void> {
    if (!isBrowser || !this.sentryOptions?.enabled || !this.sentryOptions?.dsn) return;
    try {
      const importer =
        this.sentryOptions.importSentry ??
        (async () => {
          const dynamicImport = new Function('m', 'return import(m)') as (
            m: string,
          ) => Promise<unknown>;
          return dynamicImport('@sentry/browser');
        });
      const mod = (await importer()) as { default?: SentryLike } & SentryLike;
      const sentry: SentryLike = mod?.default && mod.default.init ? mod.default : mod;
      if (!sentry?.init) return;
      sentry.init({
        dsn: this.sentryOptions.dsn,
        environment: this.sentryOptions.environment ?? this.getEnv(),
        release: this.sentryOptions.release,
        tracesSampleRate: this.sentryOptions.tracesSampleRate ?? 0,
      });
      sentry.setTag?.('namespace', this.prefix);
      sentry.setContext?.('trace', { traceId: this.traceId });
      this.sentry = sentry;
    } catch {
      this.sentry = null;
    }
  }

  private formatPrefix(): [string, string] {
    return [`%c ==== ${this.prefix} ===>`, `color: ${this.color}; font-weight: bold;`];
  }

  debug(...args: unknown[]): void {
    this.emit('debug', args);
  }

  info(...args: unknown[]): void {
    this.emit('info', args);
  }

  warn(...args: unknown[]): void {
    this.emit('warn', args);
  }

  error(...args: unknown[]): void {
    this.emit('error', args);
    const err =
      args.find((a) => a instanceof Error) || new Error(args.map((a) => String(a)).join(' '));
    if (this.sentry?.withScope) {
      this.sentry.withScope((scope) => {
        scope.setContext?.('trace', { traceId: this.traceId });
        this.sentry?.captureException?.(err);
      });
      return;
    }
    this.sentry?.captureException?.(err);
  }

  track(event: string, payload: Record<string, unknown> = {}): void {
    const entry: LoggerEntry = {
      level: 'info',
      prefix: this.prefix,
      traceId: this.traceId,
      timestamp: new Date().toISOString(),
      args: [{ event, payload }],
    };
    void this.report(entry);
    this.sentry?.addBreadcrumb?.({
      category: 'track',
      message: event,
      data: payload,
    });
  }

  private emit(level: LoggerLevelName, args: unknown[]): void {
    if (!this.enabled || !this.shouldLog(level)) return;
    const entry: LoggerEntry = {
      level,
      prefix: this.prefix,
      traceId: this.traceId,
      timestamp: new Date().toISOString(),
      args,
    };
    this.onLog?.(entry);
    void this.report(entry);

    const [format, style] = this.formatPrefix();
    if (level === 'warn') {
      this.output.warn(format, style, ...args);
      return;
    }
    if (level === 'error') {
      this.output.error(format, style, ...args);
      return;
    }
    this.output.log(format, style, ...args);
  }

  private shouldLog(level: LoggerLevelName): boolean {
    return levelNameMap[level] >= this.loggerLevel;
  }

  private async report(entry: LoggerEntry): Promise<void> {
    if (!this.reporter?.enabled || !this.reporter.onReport) return;
    try {
      await this.reporter.onReport(entry);
    } catch {
      // reporting failures should never break app flow
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setTraceId(traceId?: string): void {
    this.traceId = traceId || this.generateTraceId();
    this.sentry?.setContext?.('trace', { traceId: this.traceId });
  }

  getTraceId(): string {
    return this.traceId;
  }

  setLevel(level: number | LoggerLevelName): void {
    this.loggerLevel = this.normalizeLevel(level);
  }

  getLevel(): LogLevel {
    return this.loggerLevel;
  }
}

export function createLogger(options?: LoggerOptions): DoLogger {
  return new DoLogger(options);
}

export const doLog = new DoLogger();
