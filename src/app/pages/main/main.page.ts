import { Translations } from '../../components/translations/translations.component';
import { LanguageService } from '../../services/language/language.service';
import { NewsInterfaceUnion } from '../../types/news-union.type';
import { NewsService } from '../../services/news-service/news.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NewsTypes } from '../../enums/news-types.enum';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';

@Component({
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.less'],
})
export class MainPageComponent extends Translations implements OnInit, OnDestroy {
    public news: NewsInterfaceUnion[];
    public newsTypes = NewsTypes;

    private onDestroy$ = new Subject<void>();

    constructor(private newsService: NewsService, protected languageService: LanguageService) {
        super(languageService);
    }

    ngOnInit(): void {
        this.newsService.loadMainPageNews();
        this.initNewsSubscription();
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

    private initNewsSubscription(): void {
        this.newsService
            .getMainPageNews$()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((news: NewsInterfaceUnion[]) => (this.news = news));
    }
}
