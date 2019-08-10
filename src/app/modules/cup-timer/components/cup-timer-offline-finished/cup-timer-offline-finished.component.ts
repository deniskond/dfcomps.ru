import { Translations } from '../../../../components/translations/translations.component';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { LanguageService } from '../../../../services/language/language.service';
import { Observable, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-cup-timer-offline-finished',
    templateUrl: './cup-timer-offline-finished.component.html',
})
export class CupTimerOfflineFinishedComponent extends Translations implements OnInit, OnChanges {
    @Input()
    cupName: string;
    @Input()
    newsId: number;
    @Input()
    mapLink: string;
    @Input()
    endTime: number;

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
