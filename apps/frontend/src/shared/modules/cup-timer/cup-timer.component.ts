import { Component, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CupTypes } from '@dfcomps/contracts';

@Component({
  selector: 'app-cup-timer',
  templateUrl: './cup-timer.component.html',
  styleUrls: ['./cup-timer.component.less'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerComponent {
  @Input()
  cupName: string;
  @Input()
  cupType: CupTypes;
  @Input()
  startTime: string;
  @Input()
  endTime: string;
  @Input()
  mapLink: string;
  @Input()
  newsId: number | null;
  @Input()
  customNews: string | null;
  @Input()
  server: string | undefined | null;

  public cupTypes = CupTypes;
}
