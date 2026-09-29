import type { AdminMaps } from '@/maps';
import type { AxiosInstanceType } from '@/plugins/axios';
import type { KuUtilsFns } from '@/plugins/globalVariables';

declare module 'vue' {
  interface ComponentCustomProperties {
    $MAPS: AdminMaps;
    $axios: AxiosInstanceType;
    $utils: KuUtilsFns;
    $UI_HEADER_HEIGHT: number;
  }
}

declare global {
  interface Window {
    axios: AxiosInstanceType;
  }
}

export {};
