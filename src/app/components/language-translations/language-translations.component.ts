import { Languages } from '../../enums/languages.enum';
import { LanguageService } from '../../services/language/language.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-language-translations',
    template: '',
})
export class LanguageTranslationsComponent implements OnInit, OnDestroy {
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
        this.languageService.getLanguageTranslations$()
            .pipe(takeUntil(this.languageOnDestroy$))
            .subscribe((translations: Record<string, string>) => (this.translations = translations));
    }
}
