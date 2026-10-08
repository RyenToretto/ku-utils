import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ClubActivityList } from './_module/club-activity-list';

@Component({
  selector: 'ka-club-activity-layer',
  imports: [ClubActivityList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ka-club-activity-list />',
})
export default class ClubActivityLayer {}
