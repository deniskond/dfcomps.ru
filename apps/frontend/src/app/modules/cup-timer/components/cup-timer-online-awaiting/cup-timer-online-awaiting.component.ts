import { Languages } from './../../../../enums/languages.enum';
import { LanguageService } from '../../../../services/language/language.service';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';

@Component({
  selector: 'app-cup-timer-online-awaiting',
  templateUrl: './cup-timer-online-awaiting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerOnlineAwaitingComponent implements OnInit, OnChanges {
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
