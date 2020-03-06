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
    public news: NewsInterfaceUnion[] = [
        {
            type: NewsTypes.SIMPLE,
            id: '',
            authorId: '',
            authorName: 'Nosf',
            currentRound: '',
            datetime: '',
            header: 'Dfcomps.ru переезжает на новый хостинг',
            headerEn: 'Dfcomps.ru moves to new hosting',
            image: '',
            cupId: '',
            multicupId: '',
            startTime: '',
            text: `Всем привет! Хостинг masterhost окончательно себя дискредитировал, если хотите подробнее узнать что сейчас с ним происходит, можете почитать статью на хабре https://habr.com/ru/news/t/490794/. Если коротко, то в текущей ситуации работа хостинга никак не гарантируется и все базы данных находятся в открытом доступе. В такой ситуации продолжать использовать хостинг нельзя, поэтому база данных была удалена. Все бэкапы сайта сделаны, ничего не будет потеряно :) Постараемся как можно быстрее переехать на новый хостинг, скорее всего это займет 1-2 дня, поэтому текущий WarCup продлевается на один день до вечера воскресенья 22:30 мск. `,
            textEn: `Hello! Masterhost hosting has completely discredited itself, if you want to know more about what is happening with it now, you can read the article https://habr.com/ru/news/t/490794/. In short, in the current situation, the operation of the hosting is in no way guaranteed and all databases are in the public domain. In this situation, the hosting can't be used, so the database was deleted. All site backups are done, nothing will be lost :) We will try to move to a new hosting as soon as possible, most likely it will take 1-2 days, therefore, the current WarCup is extended by one day until Sunday evening 19:30 GMT+0.`,
            youtube: '',
            tableJson: '',
            twitch1: '',
            twitch2: '',
        },
    ];
    public newsTypes = NewsTypes;
    public language: Languages;
    public languages = Languages;

    private onDestroy$ = new Subject<void>();

    constructor(private router: Router, private newsService: NewsService, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        // this.newsService.loadMainPageNews();
        // this.initNewsSubscription();
        // this.initMainComponentNewsSubscription();
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
