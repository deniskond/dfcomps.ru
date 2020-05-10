import { Languages } from './../../../../enums/languages.enum';
import { LanguageService } from '../../../../services/language/language.service';
import { Component, OnInit, OnChanges, Input, EventEmitter, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatCupTime } from '../../helpers/cup-time-format.helpers';

@Component({
    selector: 'app-cup-timer-online-progress',
    templateUrl: './cup-timer-online-progress.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerOnlineProgressComponent implements OnInit, OnChanges {
    @Input()
    cupName: string;
    @Input()
    newsId: string;
    @Input()
    endTime: string;
    @Input()
    server: string;

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
