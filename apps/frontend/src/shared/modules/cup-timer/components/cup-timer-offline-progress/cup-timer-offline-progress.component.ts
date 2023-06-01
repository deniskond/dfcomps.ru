import { Languages } from './../../../../enums/languages.enum';
import { LanguageService } from '../../../../services/language/language.service';
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';

@Component({
  selector: 'app-cup-timer-offline-progress',
  templateUrl: './cup-timer-offline-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerOfflineProgressComponent implements OnInit, OnChanges {
  @Input()
  cupName: string;
  @Input()
  newsId: string;
  @Input()
  mapLink: string;
  @Input()
  endTime: string;
  @Input()
  customNews: string | undefined;

  @Output()
  finished = new EventEmitter<void>();

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
