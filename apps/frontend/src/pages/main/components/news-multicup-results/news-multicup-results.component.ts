import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Physics } from '~shared/enums/physics.enum';
import { NewsMulticupResultsInterface } from '~shared/services/news-service/interfaces/news-multicup-results.interface';

@Component({
  selector: 'app-news-multicup-results',
  templateUrl: './news-multicup-results.component.html',
  styleUrls: ['./news-multicup-results.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsMulticupResultsComponent implements OnInit {
  @Input() news: NewsMulticupResultsInterface;

  public physics = Physics;
  public tableCellsCount: number;

  ngOnInit(): void {
    this.tableCellsCount =
      this.news.vq3Results.length > this.news.cpmResults.length
        ? this.news.vq3Results.length
        : this.news.cpmResults.length;
  }
}
