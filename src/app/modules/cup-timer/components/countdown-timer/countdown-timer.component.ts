import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_MINUTE = 60;

@Component({
    selector: 'app-countdown-timer',
    templateUrl: './countdown-timer.component.html',
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
    @Input()
    currentTime: number;
    @Input()
    targetTime: number;

    @Output()
    finished = new EventEmitter<void>();

    public currentTimerValue$: BehaviorSubject<number>;
    public currentTimerCaption$: Observable<string>;
    public currentDaysCaption$: Observable<number>;

    private timerSubscription: Subscription;
    private syncSubscription: Subscription;

    ngOnInit(): void {
        const timeDiff = this.targetTime - this.currentTime;

        this.currentTimerValue$ = new BehaviorSubject(timeDiff > 0 ? timeDiff : 0);

        this.currentDaysCaption$ = this.currentTimerValue$.pipe(
            map((timerValue: number) => this.mapTimerValueToDaysCount(timerValue)),
        );

        this.currentTimerCaption$ = this.currentTimerValue$.pipe(
            map((timerValue: number) => this.mapTimerValueToTimerCaption(timerValue)),
        );

        this.timerSubscription = interval(1000).subscribe(() =>
            this.currentTimerValue$.next(this.targetTime - moment().unix()),
        );
    }

    ngOnDestroy(): void {
        this.timerSubscription.unsubscribe();
        this.syncSubscription.unsubscribe();
    }

    public mapTimerValueToTimerCaption(timerValue: number): string {
        const daysLeft = Math.floor(timerValue / SECONDS_IN_DAY);
        const hoursTimer = timerValue - daysLeft * SECONDS_IN_DAY;
        const hours = Math.floor(hoursTimer / SECONDS_IN_HOUR);
        const minutes = Math.floor((hoursTimer - hours * SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
        const seconds = hoursTimer - hours * SECONDS_IN_HOUR - minutes * SECONDS_IN_MINUTE;

        return (
            `${this.addLeadingZeroIfNeeded(hours)}:` +
            `${this.addLeadingZeroIfNeeded(minutes)}:` +
            `${this.addLeadingZeroIfNeeded(seconds)}`
        );
    }

    public mapTimerValueToDaysCount(timerValue: number): number {
        return Math.floor(timerValue / SECONDS_IN_DAY);
    }

    private addLeadingZeroIfNeeded(amount: number): string {
        return amount >= 10 ? `${amount}` : `0${amount}`;
    }
}
