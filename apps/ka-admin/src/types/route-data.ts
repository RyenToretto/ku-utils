import type { Data } from '@angular/router';

/** 路由 `data`（对齐 kr `handle` / kv3 `meta`） */
export interface AppRouteData extends Data {
  title?: string;
  permission?: string;
  hideHeader?: boolean;
  isHeaderTab?: boolean;
  useFullView?: boolean;
  desc?: string;
  nestLevel?: number;
  nestTrail?: string[];
  doFilterPanel?: {
    buttonCount: number;
    filterCount: number;
    line: number;
    fillViewportLayout?: boolean;
  };
  activePath?: string;
}
