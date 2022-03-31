import { Languages } from './../../../../enums/languages.enum';
import { LanguageService } from '../../../../services/language/language.service';
import { Component, OnInit, OnChanges, Input, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';

@Component({
  selector: 'app-cup-timer-online-finished',
  templateUrl: './cup-timer-online-finished.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerOnlineFinishedComponent implements OnInit, OnChanges {
  @Input()
  cupName: string;
  @Input()
  newsId: number;
  @Input()
  endTime: string;
  @Input()
  server: string;

  public formattedTime$: Observable<string>;

  private endTime$ = new ReplaySubject<string>(1);

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.formattedTime$ = combineLatest([this.endTime$, this.languageService.getLanguage$()]).pipe(
      map(([time, language]: [string, Languages]) => formatCupTime(time, language)),
    );
  }

  ngOnChanges({ endTime }: SimpleChanges): void {
    if (endTime && endTime.currentValue) {
      this.endTime$.next(endTime.currentValue);
    }
  }
}
