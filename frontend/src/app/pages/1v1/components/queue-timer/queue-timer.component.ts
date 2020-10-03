import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { mapSecondsToFormattedTime } from '../../helpers/match-progress-time-format.helper';

@Component({
    selector: 'app-queue-timer',
    templateUrl: './queue-timer.component.html',
    styleUrls: ['./queue-timer.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueTimerComponent implements OnInit {
    public formattedTime$: Observable<string>;

    ngOnInit(): void {
        this.formattedTime$ = interval(1000).pipe(
            map((seconds: number) => seconds + 1),
            startWith(0),
            map(mapSecondsToFormattedTime),
        );
    }
}
