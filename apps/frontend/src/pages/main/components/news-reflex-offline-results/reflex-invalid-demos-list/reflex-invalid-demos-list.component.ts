import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { InvalidDemoInterface } from '~shared/interfaces/invalid-demo.interface';

@Component({
  selector: 'app-reflex-invalid-demos-list',
  templateUrl: './reflex-invalid-demos-list.component.html',
  styleUrls: ['./reflex-invalid-demos-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReflexInvalidDemosListComponent {
  @Input() cupId: number;
  @Input() invalidDemos: InvalidDemoInterface[];
}
