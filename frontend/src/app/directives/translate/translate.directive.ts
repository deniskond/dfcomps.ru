import { RUSSIAN_TRANSLATIONS } from './../../translations/ru.translations';
import { ENGLISH_TRANSLATIONS } from './../../translations/en.translations';
import { Languages } from '../../enums/languages.enum';
import { LanguageService } from '../../services/language/language.service';
import { Directive, ElementRef, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject, ReplaySubject, combineLatest } from 'rxjs';

@Directive({
    selector: '[translate]',
})
export class TranslateDirective implements OnInit, OnDestroy, OnChanges {
    @Input() translation: string;

    private translation$ = new ReplaySubject<string>(1);
    private onDestroy$ = new Subject<void>();

    constructor(private elementRef: ElementRef<HTMLElement>, private languageService: LanguageService) {}

    ngOnInit(): void {
        this.initLanguageSubscription();
    }

    ngOnChanges({ translation }: SimpleChanges): void {
        if (translation && this.translation) {
            this.translation$.next(this.translation);
        }
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private initLanguageSubscription(): void {
        combineLatest([this.languageService
            .getLanguage$(), this.translation$])
        
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(
                ([language, translation]: [Languages, string]) =>
                    (this.elementRef.nativeElement.innerText =
                        language === Languages.EN ? ENGLISH_TRANSLATIONS[translation] : RUSSIAN_TRANSLATIONS[translation]),
            );
    }
}
