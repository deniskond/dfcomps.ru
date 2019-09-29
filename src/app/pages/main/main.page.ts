import { Languages } from '../../enums/languages.enum';
import { Translations } from '../../components/translations/translations.component';
import { LanguageService } from '../../services/language/language.service';
import { NewsInterfaceUnion } from '../../types/news-union.type';
import { NewsService } from '../../services/news-service/news.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NewsTypes } from '../../enums/news-types.enum';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.less'],
})
export class MainPageComponent extends Translations implements OnInit, OnDestroy {
    public news: NewsInterfaceUnion[];
    public newsTypes = NewsTypes;
    public language: Languages;
    public languages = Languages;

    private onDestroy$ = new Subject<void>();

    constructor(private router: Router, private newsService: NewsService, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.newsService.loadMainPageNews();
        this.initNewsSubscription();
        this.initMainComponentNewsSubscription();
        super.ngOnInit();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        super.ngOnDestroy();
    }

    public formatDate(date: string): string {
        return moment(date).format('DD.MM.YYYY HH:mm');
    }

    public reloadNews(): void {
        this.newsService.loadMainPageNews();
    }

    public navigateToArchive(): void {
        this.router.navigate(['/archive']);
    }

    private initMainComponentNewsSubscription(): void {
        this.languageService
            .getLanguage$()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((language: Languages) => (this.language = language));
    }

    private initNewsSubscription(): void {
        this.newsService
            .getMainPageNews$()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((news: NewsInterfaceUnion[]) => (this.news = news));
    }
}
