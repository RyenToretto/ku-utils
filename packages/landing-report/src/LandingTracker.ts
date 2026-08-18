import { CoreTracker } from '@ku-utils/report';

/**
 * 落地页埋点 Tracker
 * 覆写 afterInit：不自动上报 alive / heartbeat / start
 */
export class LandingTracker extends CoreTracker {
  protected override requiresAliveBarrier = false;

  protected override async afterInit(): Promise<void> {
    // 落地页不自动上报 alive / heartbeat / start
  }
}
