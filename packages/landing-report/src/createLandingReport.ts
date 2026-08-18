import { createTrackerFactory } from '@ku-utils/report';

import { LandingTracker } from './LandingTracker';

/**
 * 创建落地页埋点上报实例（无 alive / heartbeat / start 自动上报）
 */
export const createLandingReport = createTrackerFactory(LandingTracker, 'createLandingReport');

export default createLandingReport;
