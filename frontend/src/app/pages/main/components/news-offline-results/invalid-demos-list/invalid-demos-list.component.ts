import { InvalidDemoInterface } from '../../../../../interfaces/invalid-demo.interface';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-invalid-demos-list',
    templateUrl: './invalid-demos-list.component.html',
    styleUrls: ['./invalid-demos-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvalidDemosListComponent {
    @Input() cupId: string;
    @Input() invalidDemos: InvalidDemoInterface[];
}
