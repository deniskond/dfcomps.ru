import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NewsOnlineResultsInterface } from '~shared/services/news-service/interfaces/news-online-results.interface';

@Component({
  selector: 'app-news-online-results',
  templateUrl: './news-online-results.component.html',
  styleUrls: ['./news-online-results.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsOnlineResultsComponent {
  @Input() news: NewsOnlineResultsInterface;
}
