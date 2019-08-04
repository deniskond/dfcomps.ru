import { Languages } from '../../enums/languages.enum';
import { Injectable } from '@angular/core';
import { ENGLISH_TRANSLATIONS } from './translations/en.translations';
import { RUSSIAN_TRANSLATIONS } from './translations/ru.translations';
import { ReplaySubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    private language: Languages;
    private translations$ = new ReplaySubject<Record<string, string>>(1);

    public get languageTranslations$(): Observable<Record<string, string>> {
        return this.translations$.asObservable();
    }

    public setLanguage(language: Languages): void {
        this.language = language;
        this.translations$.next(language === Languages.EN ? ENGLISH_TRANSLATIONS : RUSSIAN_TRANSLATIONS);
    }

    public getLanguage(): Languages {
        return this.language;
    }
}
