import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-cup-timer-online-awaiting',
    templateUrl: './cup-timer-online-awaiting.component.html',
})
export class CupTimerOnlineAwaitingComponent extends Translations implements OnInit, OnChanges {
    @Input()
    cupName: string;
    @Input()
    startTime: number;

    @Output()
    finished = new EventEmitter<void>();

    public formattedTime$: Observable<string>;

    private startTime$ = new ReplaySubject<number>(1);

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.formattedTime$ = this.startTime$.pipe(switchMap((time: number) => this.getFormattedCupTime$(time)));
        super.ngOnInit();
    }

    ngOnChanges({ startTime }: SimpleChanges): void {
        if (startTime && startTime.currentValue) {
            this.startTime$.next(startTime.currentValue);
        }
    }
}
