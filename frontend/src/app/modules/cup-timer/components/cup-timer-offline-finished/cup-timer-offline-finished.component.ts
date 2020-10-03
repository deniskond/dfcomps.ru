import { Languages } from './../../../../enums/languages.enum';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { LanguageService } from '../../../../services/language/language.service';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';

@Component({
    selector: 'app-cup-timer-offline-finished',
    templateUrl: './cup-timer-offline-finished.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerOfflineFinishedComponent implements OnInit, OnChanges {
    @Input()
    cupName: string;
    @Input()
    newsId: number;
    @Input()
    mapLink: string;
    @Input()
    endTime: string;
    @Input()
    customNews: string;

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
