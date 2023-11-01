import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { InvalidDemoInterface } from '@dfcomps/contracts';

@Component({
  selector: 'app-invalid-demos-list',
  templateUrl: './invalid-demos-list.component.html',
  styleUrls: ['./invalid-demos-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvalidDemosListComponent {
  @Input() cupId: number;
  @Input() invalidDemos: InvalidDemoInterface[];
}
