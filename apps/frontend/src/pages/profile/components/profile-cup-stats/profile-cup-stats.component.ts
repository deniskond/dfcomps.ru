import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ProfileCupStatInterface } from '@dfcomps/contracts';


@Component({
  selector: 'app-profile-cup-stats',
  templateUrl: './profile-cup-stats.component.html',
  styleUrls: ['./profile-cup-stats.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCupStatsComponent {
  @Input()
  stats: ProfileCupStatInterface;
}
