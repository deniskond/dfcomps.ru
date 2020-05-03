import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NewsInterfaceUnion } from '../../../../types/news-union.type';
import { Translations } from '../../../../components/translations/translations.component';
import { LanguageService } from '../../../../services/language/language.service';
import { map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Languages } from '../../../../enums/languages.enum';
import { MAIN_URL } from '../../../../configs/url-params.config';

@Component({
    selector: 'app-news-social-links',
    templateUrl: './news-social-links.component.html',
    styleUrls: ['./news-social-links.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSocialLinksComponent extends Translations implements OnInit, OnDestroy {
    @Input() news: NewsInterfaceUnion;

    public telegramShareLink$: Observable<string>;
    public twitterShareLink$: Observable<string>;
    private onDestroy$ = new Subject<void>();

    constructor(protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.initLinkObservables();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        super.ngOnDestroy();
    }

    private initLinkObservables(): void {
        const mappedHeader$ = this.languageService
            .getLanguage$()
            .pipe(map((language: Languages) => (language === Languages.EN ? this.news.headerEn : this.news.header)));

        this.telegramShareLink$ = mappedHeader$.pipe(
            map((header: string) => `https://t.me/share/url?url=${MAIN_URL}news/${this.news.id}&text=${encodeURIComponent(header)}`),
        );

        this.twitterShareLink$ = mappedHeader$.pipe(
            map((header: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(header)} ${MAIN_URL}/news/${this.news.id}`),
        );
    }
}
