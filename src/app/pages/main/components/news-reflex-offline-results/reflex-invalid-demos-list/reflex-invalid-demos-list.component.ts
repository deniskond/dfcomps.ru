import { InvalidDemoInterface } from '../../../../../interfaces/invalid-demo.interface';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-reflex-invalid-demos-list',
    templateUrl: './reflex-invalid-demos-list.component.html',
    styleUrls: ['./reflex-invalid-demos-list.component.less'],
})
export class ReflexInvalidDemosListComponent {
    @Input() cupId: string;
    @Input() invalidDemos: InvalidDemoInterface[];
}
