import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
            map(this.mapSecondsToFormattedTime),
        );
    }

    private mapSecondsToFormattedTime(count: number): string {
        const minutes = Math.floor(count / 60);
        const seconds = count % 60;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();

        return `${formattedMinutes}:${formattedSeconds}`;
    }
}
