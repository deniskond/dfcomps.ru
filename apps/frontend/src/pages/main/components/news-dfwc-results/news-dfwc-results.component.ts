import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DfwcResultsService } from './services/dfwc-results.service';
import { NewsOfflineResultsInterface } from '~shared/services/news-service/interfaces/news-offline-results.interface';

@Component({
  selector: 'app-news-dfwc-results',
  templateUrl: './news-dfwc-results.component.html',
  styleUrls: ['./news-dfwc-results.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsDfwcResultsComponent implements OnInit {
  @Input()
  news: NewsOfflineResultsInterface;

  public mappedOfflineNews: NewsOfflineResultsInterface;

  constructor(private dfwcResultsService: DfwcResultsService) {}

  ngOnInit(): void {
    this.mappedOfflineNews = this.dfwcResultsService.mapDfwcResultsToOfflineNews(this.news);
  }
}
