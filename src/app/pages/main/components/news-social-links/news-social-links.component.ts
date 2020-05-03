import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NewsInterfaceUnion } from '../../../../types/news-union.type';
import { Translations } from '../../../../components/translations/translations.component';
import { LanguageService } from '../../../../services/language/language.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
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

    public language: Languages;   
    public telegramShareLink: string;
    public twitterShareLink: string;
    private onDestroy$ = new Subject<void>();

    constructor(protected languageService: LanguageService, private changeDetectorRef: ChangeDetectorRef) {        
        super(languageService);
    }

    ngOnInit(): void {
        this.languageService
            .getLanguage$()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((language: Languages) => {                
                const header = language === Languages.EN ? this.news.headerEn : this.news.header;
                
                this.language = language;
                this.telegramShareLink = `https://t.me/share/url?url=${MAIN_URL}news/${this.news.id}&text=${encodeURIComponent(header)}`;
                this.twitterShareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(header)} ${MAIN_URL}/news/${this.news.id}`;
                this.changeDetectorRef.detectChanges();
            });
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        super.ngOnDestroy();
    }
}
