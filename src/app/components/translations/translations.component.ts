import { RUSSIAN_TRANSLATIONS } from '../../translations/ru.translations';
import { ENGLISH_TRANSLATIONS } from '../../translations/en.translations';
import { Languages } from '../../enums/languages.enum';
import { LanguageService } from '../../services/language/language.service';
import { OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class Translations implements OnInit, OnDestroy {
    public translations: Record<string, string>;

    private languageOnDestroy$ = new Subject<void>();

    constructor(protected languageService: LanguageService) {}

    ngOnInit(): void {
        this.initLanguageSubscription();
    }

    ngOnDestroy(): void {
        this.languageOnDestroy$.next();
        this.languageOnDestroy$.complete();
    }

    public setLanguage(language: Languages): void {
        this.languageService.setLanguage(language);
    }

    private initLanguageSubscription(): void {
        this.languageService
            .getLanguage$()
            .pipe(takeUntil(this.languageOnDestroy$))
            .subscribe(
                (language: Languages) =>
                    (this.translations = language === Languages.EN ? ENGLISH_TRANSLATIONS : RUSSIAN_TRANSLATIONS),
            );
    }
}
