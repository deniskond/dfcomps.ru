import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NewsOnlineResultsInterface } from '@dfcomps/contracts';

@Component({
  selector: 'app-news-online-results',
  templateUrl: './news-online-results.component.html',
  styleUrls: ['./news-online-results.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class NewsOnlineResultsComponent {
  @Input() news: NewsOnlineResultsInterface;
}
