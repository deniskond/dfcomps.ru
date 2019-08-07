import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { NewsInterfaceUnion } from '../../../../types/news-union.type';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Languages } from '../../../../enums/languages.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-html-news',
    templateUrl: './html-news.component.html',
    styleUrls: ['./html-news.component.less'],
})
export class HtmlNewsComponent extends Translations implements OnInit, OnDestroy {
    @Input() news: NewsInterfaceUnion;

    public newsHtml: string;

    private onDestroy$ = new Subject<void>();

    constructor(private domSanitizer: DomSanitizer, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.languageService.getLanguage$().pipe(takeUntil(this.onDestroy$)).subscribe((language: Languages) => {
            this.newsHtml = language === Languages.RU ? this.news.text : this.news.textEn;
            this.domSanitizer.bypassSecurityTrustHtml(this.newsHtml);
        });

        super.ngOnInit();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        super.ngOnDestroy();
    }
}
