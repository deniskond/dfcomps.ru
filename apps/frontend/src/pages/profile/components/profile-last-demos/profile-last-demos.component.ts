import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ProfileDemosInterface } from '@dfcomps/contracts';

@Component({
  selector: 'app-profile-last-demos',
  templateUrl: './profile-last-demos.component.html',
  styleUrls: ['./profile-last-demos.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLastDemosComponent {
  @Input()
  demos: ProfileDemosInterface[];
}
