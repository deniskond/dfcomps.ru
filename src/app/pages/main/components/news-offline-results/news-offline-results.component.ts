import { API_URL } from '../../../../configs/url-params.config';
import { Physics } from '../../../../enums/physics.enum';
import { NewsOfflineResultsInterface } from '../../../../services/news-service/interfaces/news-offline-results.interface';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-news-offline-results',
    templateUrl: './news-offline-results.component.html',
    styleUrls: ['./news-offline-results.component.less'],
})
export class NewsOfflineResultsComponent implements OnInit {
    @Input() news: NewsOfflineResultsInterface;

    public physics = Physics;
    public maxDemosCount: number;

    ngOnInit(): void {
        this.maxDemosCount =
            this.news.cpmResults.valid.length > this.news.vq3Results.valid.length
                ? this.news.cpmResults.valid.length
                : this.news.vq3Results.valid.length;
    }

    public getArchiveLink(archiveLink: string): string {
        return `${API_URL}/${archiveLink}`;
    }
}
