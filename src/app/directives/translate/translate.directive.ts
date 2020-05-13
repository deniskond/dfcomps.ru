import { RUSSIAN_TRANSLATIONS } from './../../translations/ru.translations';
import { ENGLISH_TRANSLATIONS } from './../../translations/en.translations';
import { Languages } from '../../enums/languages.enum';
import { LanguageService } from '../../services/language/language.service';
import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Directive({
    selector: '[translate]',
})
export class TranslateDirective implements OnInit, OnDestroy {
    @Input() translation: string;

    private onDestroy$ = new Subject<void>();

    constructor(private elementRef: ElementRef<HTMLElement>, private languageService: LanguageService) {}

    ngOnInit(): void {
        this.initLanguageSubscription();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private initLanguageSubscription(): void {
        this.languageService
            .getLanguage$()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(
                (language: Languages) =>
                    (this.elementRef.nativeElement.innerText =
                        language === Languages.EN ? ENGLISH_TRANSLATIONS[this.translation] : RUSSIAN_TRANSLATIONS[this.translation]),
            );
    }
}
