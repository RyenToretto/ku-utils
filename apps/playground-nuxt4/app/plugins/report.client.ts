import { ReportDemoController } from '../report/demoTracker';

export default defineNuxtPlugin(() => {
  const reportDemo = new ReportDemoController();

  return {
    provide: {
      reportDemo,
    },
  };
});
