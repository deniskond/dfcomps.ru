import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { interval, Observable, ReplaySubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { mapSecondsToFormattedTime } from '../../helpers/match-progress-time-format.helper';
import { PickbanPhases } from '../../enums/pickban-phases.enum';

@Component({
  selector: 'app-match-progress-timer',
  templateUrl: './match-progress-timer.component.html',
  styleUrls: ['./match-progress-timer.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchProgressTimerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() initialSeconds: number;
  @Input() pickbanPhase: PickbanPhases;

  public formattedTime$: Observable<string>;
  private updateTimer$ = new ReplaySubject<number | null>(1);

  ngOnInit(): void {
    this.initFormattedTimeObservable();
  }

  ngOnChanges({ pickbanPhase, initialSeconds }: SimpleChanges): void {
    if (pickbanPhase || initialSeconds) {
      this.updateTimer$.next(null);
    }
  }

  ngOnDestroy(): void {
    this.updateTimer$.complete();
  }

  private initFormattedTimeObservable(): void {
    this.formattedTime$ = this.updateTimer$.pipe(
      switchMap(() =>
        interval(1000).pipe(
          map((seconds: number) => seconds + 1),
          startWith(0),
          map((passedTime: number) => this.initialSeconds - passedTime),
          map((passedTime: number) => (passedTime > 0 ? passedTime : 0)),
          map(mapSecondsToFormattedTime),
        ),
      ),
    );
  }
}
