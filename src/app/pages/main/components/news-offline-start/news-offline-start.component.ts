import { NewsOfflineStartInterface } from '../../../../services/news-service/interfaces/news-offline-start.interface';
import { Component, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'app-news-offline-start',
    templateUrl: './news-offline-start.component.html',
    styleUrls: ['./news-offline-start.component.less'],
})
export class NewsOfflineStartComponent {
    @Input()
    news: NewsOfflineStartInterface;

    public getFormattedDateTime(timestamp: string): string {
        return moment(+timestamp * 1000).format('DD.MM.YYYY HH:mm');
    }
}
