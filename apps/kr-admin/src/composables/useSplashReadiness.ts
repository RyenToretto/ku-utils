import { useEffect } from 'react';

import { dismissInlineAppSplash } from '@/bootstrap/removeInlineAppSplash';
import { closeSplashGate } from '@/bootstrap/splashGate';

export function useSplashReadiness(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    void (async () => {
      await dismissInlineAppSplash();
      closeSplashGate();
    })();
  }, [ready]);
}
