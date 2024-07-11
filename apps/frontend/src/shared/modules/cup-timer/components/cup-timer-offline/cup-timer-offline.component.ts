import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { getCurrentTimerState } from '../../helpers/cup-timer-state.helper';
import { CupTimerStates } from '~shared/enums/cup-timer-states.enum';

@Component({
  selector: 'app-cup-timer-offline',
  templateUrl: './cup-timer-offline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerOfflineComponent implements OnInit {
  @Input()
  cupName: string;
  @Input()
  startTime: string;
  @Input()
  endTime: string;
  @Input()
  mapLink: string | null;
  @Input()
  newsId: number | null;
  @Input()
  customNews: string | null;

  public timerState: CupTimerStates;
  public timerStates = CupTimerStates;

  ngOnInit(): void {
    this.timerState = getCurrentTimerState(this.startTime, this.endTime);
  }

  public changeTimerState(timerState: CupTimerStates): void {
    this.timerState = timerState;
  }
}
