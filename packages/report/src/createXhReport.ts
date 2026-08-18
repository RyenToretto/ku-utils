import { CoreTracker } from './core';
import { createTrackerFactory } from './createTrackerFactory';

/**
 * 创建通用埋点上报实例（自动上报 alive / heartbeat / start）
 */
export const createXhReport = createTrackerFactory(CoreTracker, 'createXhReport');

export default createXhReport;
