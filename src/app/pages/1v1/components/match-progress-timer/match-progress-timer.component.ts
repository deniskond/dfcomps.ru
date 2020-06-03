import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map, startWith, takeWhile } from 'rxjs/operators';
import { mapSecondsToFormattedTime } from '../../helpers/match-progress-time-format.helper';

@Component({
    selector: 'app-match-progress-timer',
    templateUrl: './match-progress-timer.component.html',
    styleUrls: ['./match-progress-timer.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchProgressTimerComponent implements OnInit {
    @Input() initialSeconds: number;

    public formattedTime$: Observable<string>;

    ngOnInit(): void {
        this.formattedTime$ = interval(1000).pipe(
            map((seconds: number) => seconds + 1),
            startWith(0),
            map((passedTime: number) => this.initialSeconds - passedTime),
            takeWhile((seconds: number) => seconds >= 0),
            map(mapSecondsToFormattedTime),
        );
    }
}
