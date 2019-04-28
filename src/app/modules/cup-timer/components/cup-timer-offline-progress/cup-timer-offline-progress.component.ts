import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';

@Component({
    selector: 'app-cup-timer-offline-progress',
    templateUrl: './cup-timer-offline-progress.component.html'
})
export class CupTimerOfflineProgressComponent implements OnInit {
    @Input()
    cupName: string;
    @Input()
    newsId: string;
    @Input()
    mapLink: string;
    @Input()
    endTime: number;

    @Output()
    finished = new EventEmitter<void>();

    public formattedTime: string;

    ngOnInit(): void {
        this.formattedTime = formatCupTime(this.endTime);
    }
}
