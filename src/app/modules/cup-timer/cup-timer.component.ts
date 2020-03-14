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
    startTime: string;
    @Input()
    endTime: string;
    @Input()
    mapLink: string;
    @Input()
    newsId: string;
    @Input()
    customNews: string;
    @Input()
    server: string;

    public cupTypes = CupTypes;
}
