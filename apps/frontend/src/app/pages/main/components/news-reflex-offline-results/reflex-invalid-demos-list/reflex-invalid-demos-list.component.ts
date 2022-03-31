import { InvalidDemoInterface } from '../../../../../interfaces/invalid-demo.interface';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-reflex-invalid-demos-list',
  templateUrl: './reflex-invalid-demos-list.component.html',
  styleUrls: ['./reflex-invalid-demos-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReflexInvalidDemosListComponent {
  @Input() cupId: string;
  @Input() invalidDemos: InvalidDemoInterface[];
}
