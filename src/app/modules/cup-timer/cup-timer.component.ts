import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CupTypes } from '../../enums/cup-types.enum';

@Component({
    selector: 'app-cup-timer',
    templateUrl: './cup-timer.component.html',
    styleUrls: ['./cup-timer.component.less'],
    encapsulation: ViewEncapsulation.ShadowDom,
})
export class CupTimerComponent {
    @Input()
    cupName: string;
    @Input()
    cupType: CupTypes;
    @Input()
    startTime: number;
    @Input()
    endTime: number;
    @Input()
    mapLink: string;
    @Input()
    newsId: string;

    public cupTypes = CupTypes;
}
