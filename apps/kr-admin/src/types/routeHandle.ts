export type AppRouteHandle = {
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
};
