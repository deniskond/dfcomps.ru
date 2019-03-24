import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CupTimerTypes } from './enums/cup-timer-types.enum';
import { CupTimerService } from './services/cup-timer.service';
import { interval, Subscription, BehaviorSubject, Observable } from 'rxjs';
import { map, withLatestFrom, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

const SYNC_TIME_SECONDS = 5;

@Component({
    selector: 'app-cup-timer',
    templateUrl: './cup-timer.component.html',
    styleUrls: ['./cup-timer.component.less'],
    providers: [CupTimerService],
})
export class CupTimerComponent implements OnInit, OnDestroy {
    @Input()
    cupName: string;
    @Input()
    cupType: CupTimerTypes;
    @Input()
    startTime: number;
    @Input()
    endTime: number;
    @Input()
    mapLink: string;
    @Input()
    newsId: string;

    public currentTimerValue$: BehaviorSubject<number>;
    public currentTimerCaption$: Observable<string>;

    private timerSubscription: Subscription;
    private syncSubscription: Subscription;

    // TODO [DFRU-3] Удалить этот сервис вообще
    constructor(private cupTimerService: CupTimerService) {}

    ngOnInit(): void {
        const timeDiff = this.endTime - moment().unix();

        this.currentTimerValue$ = new BehaviorSubject(timeDiff > 0 ? timeDiff : 0);
        this.currentTimerCaption$ = this.currentTimerValue$.pipe(map(this.mapTimerValueToTimerCaption));

        this.timerSubscription = interval(1000).subscribe(() =>
            this.currentTimerValue$.next(this.endTime - moment().unix()),
        );

        // this.syncSubscription = interval(1000 * SYNC_TIME_SECONDS)
        // .pipe(switchMap(() => this.cupTimerService.getTime()))
        // .subscribe((time: number) => this.currentTimerValue$.next(this.endTime - moment().unix()));
    }

    ngOnDestroy(): void {
        this.timerSubscription.unsubscribe();
        this.syncSubscription.unsubscribe();
    }

    public mapTimerValueToTimerCaption(timerValue: number): string {
        return `${timerValue}`;
    }
}
