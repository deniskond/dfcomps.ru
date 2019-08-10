import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_MINUTE = 60;

@Component({
    selector: 'app-countdown-timer',
    templateUrl: './countdown-timer.component.html',
})
export class CountdownTimerComponent extends Translations implements OnInit, OnDestroy {
    @Input()
    targetTime: number;

    @Output()
    finished = new EventEmitter<void>();

    public currentTimerValue$: BehaviorSubject<number>;
    public currentTimerCaption$: Observable<string>;
    public currentDaysCaption$: Observable<number>;

    private onDestroy$ = new Subject<void>();

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.currentTimerValue$ = new BehaviorSubject(this.calculateCurrentTimerValue());

        this.currentDaysCaption$ = this.currentTimerValue$.pipe(
            map((timerValue: number) => this.mapTimerValueToDaysCount(timerValue)),
        );

        this.currentTimerCaption$ = this.currentTimerValue$.pipe(
            map((timerValue: number) => this.mapTimerValueToTimerCaption(timerValue)),
        );

        interval(1000).pipe(
            takeUntil(this.onDestroy$),
        ).subscribe(() => {
            const currentTimerValue = this.calculateCurrentTimerValue();

            if (!currentTimerValue) {
                this.finished.emit();
            }

            this.currentTimerValue$.next(currentTimerValue);
        });

        super.ngOnInit();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        super.ngOnDestroy();
    }

    private calculateCurrentTimerValue(): number {
        const timeDiff = this.targetTime - moment().unix();

        return timeDiff > 0 ? timeDiff : 0;
    }

    private mapTimerValueToTimerCaption(timerValue: number): string {
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

    private mapTimerValueToDaysCount(timerValue: number): number {
        return Math.floor(timerValue / SECONDS_IN_DAY);
    }

    private addLeadingZeroIfNeeded(amount: number): string {
        return amount >= 10 ? `${amount}` : `0${amount}`;
    }
}
