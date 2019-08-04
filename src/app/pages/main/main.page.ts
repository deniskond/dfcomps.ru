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
export class MainPageComponent implements OnInit, OnDestroy {
    public news: NewsInterfaceUnion[];
    public newsTypes = NewsTypes;

    private onDestroy$ = new Subject<void>();

    constructor(private newsService: NewsService) {}

    ngOnInit(): void {
        this.newsService.loadMainPageNews();
        this.initNewsSubscription();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
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
