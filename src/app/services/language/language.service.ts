import { Languages } from '../../enums/languages.enum';
import { Injectable } from '@angular/core';
import { ENGLISH_TRANSLATIONS } from '../../translations/en.translations';
import { RUSSIAN_TRANSLATIONS } from '../../translations/ru.translations';
import { ReplaySubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    private language: Languages;
    private translations$ = new ReplaySubject<Record<string, string>>(1);

    constructor(private cookieService: CookieService) {}

    public getLanguageTranslations$(): Observable<Record<string, string>> {
        return this.translations$.asObservable();
    }

    public setLanguage(language: Languages): void {
        this.language = language;
        this.cookieService.set('language', language);
        this.translations$.next(language === Languages.EN ? ENGLISH_TRANSLATIONS : RUSSIAN_TRANSLATIONS);
    }

    public getLanguage(): Languages {
        return this.language;
    }

    public setLanguageFromCookie(): void {
        this.setLanguage(this.getLanguageFromCookie() as Languages || Languages.RU);
    }

    private getLanguageFromCookie(): unknown {
        return this.cookieService.get('language');
    }
}
