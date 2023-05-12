import { API_URL } from '~shared/rest-api';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CUSTOM_TABLE_NEWS_LIMIT } from '../../config/news.config';
import { Physics } from '~shared/enums/physics.enum';
import { InvalidDemoInterface } from '~shared/interfaces/invalid-demo.interface';
import { NewsOfflineResultsInterface } from '~shared/services/news-service/interfaces/news-offline-results.interface';

@Component({
  selector: 'app-news-reflex-offline-results',
  templateUrl: './news-reflex-offline-results.component.html',
  styleUrls: ['./news-reflex-offline-results.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsReflexOfflineResultsComponent implements OnInit, OnChanges {
  @Input() news: NewsOfflineResultsInterface;
  @Input() customTable = false;

  public physics = Physics;
  public maxDemosCount: number;
  public invalidDemos: InvalidDemoInterface[];

  ngOnInit(): void {
    this.maxDemosCount = this.getMaxDemosCount();
  }

  ngOnChanges({ news }: SimpleChanges): void {
    if (news && news.currentValue) {
      this.invalidDemos = [...this.news.cpmResults.invalid, ...this.news.vq3Results.invalid];
    }
  }

  public getArchiveLink(archiveLink: string): string {
    return `${API_URL}/${archiveLink}`;
  }

  private getMaxDemosCount(): number {
    if (this.customTable) {
      return CUSTOM_TABLE_NEWS_LIMIT;
    }

    return this.news.cpmResults.valid.length > this.news.vq3Results.valid.length
      ? this.news.cpmResults.valid.length
      : this.news.vq3Results.valid.length;
  }
}
