import { LanguageService } from '../../../../services/language/language.service';
import { NewsInterfaceUnion } from '../../../../types/news-union.type';
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Languages } from '../../../../enums/languages.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-html-news',
    templateUrl: './html-news.component.html',
    styleUrls: ['./html-news.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlNewsComponent implements OnInit, OnDestroy {
    @Input() news: NewsInterfaceUnion;

    public newsHtml: SafeHtml;

    private onDestroy$ = new Subject<void>();

    constructor(private domSanitizer: DomSanitizer, private languageService: LanguageService, private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.languageService
            .getLanguage$()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((language: Languages) => {
                const newsHtml = language === Languages.RU ? this.news.text : this.news.textEn;

                this.newsHtml = this.domSanitizer.bypassSecurityTrustHtml(newsHtml);
                this.changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
