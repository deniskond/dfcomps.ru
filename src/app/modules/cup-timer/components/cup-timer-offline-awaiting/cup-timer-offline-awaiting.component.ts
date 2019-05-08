import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';

@Component({
    selector: 'app-cup-timer-offline-awaiting',
    templateUrl: './cup-timer-offline-awaiting.component.html',
})
export class CupTimerOfflineAwaitingComponent implements OnInit {
    @Input()
    cupName: string;
    @Input()
    startTime: number;

    @Output()
    finished = new EventEmitter<void>();

    public formattedTime: string;

    ngOnInit(): void {
        this.formattedTime = formatCupTime(this.startTime);
    }
}
