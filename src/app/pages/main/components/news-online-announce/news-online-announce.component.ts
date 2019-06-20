import { NewsOnlineAnnounceInterface } from '../../../../services/news-service/interfaces/news-online-announce.interface';
import { Component, Input } from '@angular/core';
import { range } from 'lodash';

@Component({
    selector: 'app-news-online-announce',
    templateUrl: './news-online-announce.component.html',
    styleUrls: ['./news-online-announce.component.less'],
})
export class NewsOnlineAnnounceComponent {
    @Input() news: NewsOnlineAnnounceInterface;

    public range = range;
    public columnCount = 4;
    public rowCount = 10;
}
