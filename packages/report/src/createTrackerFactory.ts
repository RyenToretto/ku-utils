import { doExtendAll } from '@ku-utils/utils';

import { type CoreTracker, makeVersionCode, useToken, uuid } from './core';
import type { TrackerConfig, TrackerInstance } from './types';

const BOUND_METHODS = ['init', 'attrReport', 'setReportFetch', 'setAttrFetch'] as const;
const STATIC_UTILS = { makeVersionCode, uuid, useToken };

/**
 * 通用 Tracker 工厂封装
 *
 * 将一个 Tracker 类（CoreTracker 或其子类）包装为可调用的 TrackerInstance：
 *   - 主函数：xh(key, ext, onlyOnce) → 关键事件上报（doReport）
 *   - 实例方法：init / attrReport / setReportFetch / setAttrFetch
 *   - 静态工具：makeVersionCode / uuid / useToken
 *   - 预定义的 keys 自动挂到实例上（如 xh.LOGIN = 'login'）
 *
 * 失败兜底：构造异常时返回一个 noop TrackerInstance，避免业务方崩溃
 *
 * @param TrackerCtor Tracker 构造函数（CoreTracker 或子类）
 * @param onError 创建失败时的日志前缀，便于区分调用方（默认 'createTracker'）
 */
export function createTrackerFactory<T extends CoreTracker>(
  TrackerCtor: new (config?: TrackerConfig) => T,
  onError = 'createTracker',
): (config?: TrackerConfig) => TrackerInstance {
  return (config?: TrackerConfig): TrackerInstance => {
    try {
      const instance = new TrackerCtor(config);
      const xhInstance = instance.doReport.bind(instance) as TrackerInstance;
      doExtendAll(
        xhInstance as unknown as Record<string, unknown>,
        instance as unknown as Record<string, unknown>,
        [...BOUND_METHODS],
        instance,
      );
      Object.assign(xhInstance, STATIC_UTILS);
      instance.appendAllKeyMap(xhInstance as unknown as Record<string, unknown>);

      return xhInstance;
    } catch (e) {
      console.error(`${onError} failed`, e);

      const noop = ((...args: unknown[]) => Promise.resolve(args[0])) as TrackerInstance;
      noop.init = () => Promise.resolve();
      noop.attrReport = () => Promise.resolve(-1);

      const NOOP_FN = (): void => {};
      noop.setReportFetch = NOOP_FN;
      noop.setAttrFetch = NOOP_FN;

      Object.assign(noop, STATIC_UTILS);

      return noop;
    }
  };
}
