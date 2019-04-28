import { Component, Input, OnInit } from '@angular/core';
import { CupTimerStates } from '../../enums/cup-timer-states.enum';
import * as moment from 'moment';

@Component({
    selector: 'app-cup-timer-offline',
    templateUrl: './cup-timer-offline.component.html',
})
export class CupTimerOfflineComponent implements OnInit {
    @Input()
    cupName: string;
    @Input()
    startTime: number;
    @Input()
    endTime: number;
    @Input()
    mapLink: string;
    @Input()
    newsId: string;

    public timerState: CupTimerStates;
    public timerStates = CupTimerStates;

    ngOnInit(): void {
        this.timerState = this.getCurrentTimerState();
    }

    public changeTimerState(timerState: CupTimerStates): void {
        this.timerState = timerState;
    }

    private getCurrentTimerState(): CupTimerStates {
        if (moment().unix() < this.startTime) {
            return CupTimerStates.AWAITING_START;
        }

        if (moment().unix() < this.endTime) {
            return CupTimerStates.IN_PROGRESS;
        }

        return CupTimerStates.FINISHED;
    }
}
