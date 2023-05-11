import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CupTimerStates } from '../../enums/cup-timer-states.enum';
import { getCurrentTimerState } from '../../helpers/cup-timer-state.helper';

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
  mapLink: string;
  @Input()
  newsId: string | undefined;
  @Input()
  customNews: string | undefined;

  public timerState: CupTimerStates;
  public timerStates = CupTimerStates;

  ngOnInit(): void {
    this.timerState = getCurrentTimerState(this.startTime, this.endTime);
  }

  public changeTimerState(timerState: CupTimerStates): void {
    this.timerState = timerState;
  }
}
