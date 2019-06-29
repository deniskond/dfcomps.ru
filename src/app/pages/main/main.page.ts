import { NewsInterfaceUnion } from '../../types/news-union.type';
import { NewsService } from '../../services/news-service/news.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsTypes } from '../../enums/news-types.enum';
import * as moment from 'moment';

@Component({
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.less'],
})
export class MainPageComponent implements OnInit {
    public news$: Observable<NewsInterfaceUnion[]>;
    public newsTypes = NewsTypes;

    constructor(private newsService: NewsService) {}

    ngOnInit(): void {
        this.newsService.loadMainPageNews();
        this.news$ = this.newsService.getMainPageNews$();
    }

    public formatDate(date: string): string {
        return moment(date).format('DD.MM.YYYY HH:mm');
    }
}
