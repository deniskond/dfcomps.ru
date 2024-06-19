import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { LanguageService } from '../../../../services/language/language.service';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';
import { Languages } from '@dfcomps/contracts';

@Component({
  selector: 'app-cup-timer-offline-awaiting',
  templateUrl: './cup-timer-offline-awaiting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerOfflineAwaitingComponent implements OnInit, OnChanges {
  @Input()
  cupName: string;
  @Input()
  startTime: string;

  @Output()
  finished = new EventEmitter<void>();

  public formattedTime$: Observable<string>;

  private startTime$ = new ReplaySubject<string>(1);

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.formattedTime$ = combineLatest([this.startTime$, this.languageService.getLanguage$()]).pipe(
      map(([time, language]: [string, Languages]) => formatCupTime(time, language)),
    );
  }

  ngOnChanges({ startTime }: SimpleChanges): void {
    if (startTime && startTime.currentValue) {
      this.startTime$.next(startTime.currentValue);
    }
  }
}
