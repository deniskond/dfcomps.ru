import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ProfileDemosDtoInterface } from '~pages/profile/dto/profile-demos.dto';

@Component({
  selector: 'app-profile-last-demos',
  templateUrl: './profile-last-demos.component.html',
  styleUrls: ['./profile-last-demos.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLastDemosComponent {
  @Input()
  demos: ProfileDemosDtoInterface[];
}
