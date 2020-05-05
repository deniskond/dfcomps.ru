import { Translations } from '../../../../components/translations/translations.component';
import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { LanguageService } from '../../../../services/language/language.service';
import { Observable, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-cup-timer-offline-awaiting',
    templateUrl: './cup-timer-offline-awaiting.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupTimerOfflineAwaitingComponent extends Translations implements OnInit, OnChanges {
    @Input()
    cupName: string;
    @Input()
    startTime: string;

    @Output()
    finished = new EventEmitter<void>();

    public formattedTime$: Observable<string>;

    private startTime$ = new ReplaySubject<string>(1);

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.formattedTime$ = this.startTime$.pipe(switchMap((time: string) => this.getFormattedCupTime$(time)));
        super.ngOnInit();
    }

    ngOnChanges({ startTime }: SimpleChanges): void {
        if (startTime && startTime.currentValue) {
            this.startTime$.next(startTime.currentValue);
        }
    }
}
