import { Component, Input, OnInit } from '@angular/core';
import { CupTimerStates } from '../../enums/cup-timer-states.enum';
import { getCurrentTimerState } from '../../helpers/cup-timer-state.helper';

@Component({
    selector: 'app-cup-timer-online',
    templateUrl: './cup-timer-online.component.html',
})
export class CupTimerOnlineComponent implements OnInit {
    @Input()
    cupName: string;
    @Input()
    startTime: number;
    @Input()
    endTime: number;
    @Input()
    currentTime: number;
    @Input()
    newsId: string;
    @Input()
    server: string;

    public timerState: CupTimerStates;
    public timerStates = CupTimerStates;

    ngOnInit(): void {
        this.timerState = getCurrentTimerState(this.startTime, this.endTime);
    }

    public changeTimerState(timerState: CupTimerStates): void {
        this.timerState = timerState;
    }
}
