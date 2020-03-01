import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-cup-timer-online-finished',
    templateUrl: './cup-timer-online-finished.component.html',
})
export class CupTimerOnlineFinishedComponent extends Translations implements OnInit, OnChanges {
    @Input()
    cupName: string;
    @Input()
    newsId: number;
    @Input()
    endTime: number;
    @Input()
    server: string;

    public formattedTime$: Observable<string>;

    private endTime$ = new ReplaySubject<number>(1);

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.formattedTime$ = this.endTime$.pipe(switchMap((time: number) => this.getFormattedCupTime$(time)));
        super.ngOnInit();
    }

    ngOnChanges({ endTime }: SimpleChanges): void {
        if (endTime && endTime.currentValue) {
            this.endTime$.next(endTime.currentValue);
        }
    }
}
