import { NewsOfflineStartInterface } from '../../../../services/news-service/interfaces/news-offline-start.interface';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-news-offline-start',
    templateUrl: './news-offline-start.component.html',
    styleUrls: ['./news-offline-start.component.less'],
})
export class NewsOfflineStartComponent {
    @Input()
    news: NewsOfflineStartInterface;
}
