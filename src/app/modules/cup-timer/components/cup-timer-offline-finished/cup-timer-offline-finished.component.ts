import { Component, Input, OnInit } from '@angular/core';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';

@Component({
    selector: 'app-cup-timer-offline-finished',
    templateUrl: './cup-timer-offline-finished.component.html',
})
export class CupTimerOfflineFinishedComponent implements OnInit {
    @Input()
    cupName: string;
    @Input()
    newsId: number;
    @Input()
    mapLink: string;
    @Input()
    endTime: number;

    public formattedTime: string;

    ngOnInit(): void {
        this.formattedTime = formatCupTime(this.endTime);
    }
}
