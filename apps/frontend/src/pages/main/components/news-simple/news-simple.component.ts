import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NewsSimpleInterface } from '~shared/services/news-service/interfaces/news-simple.interface';

@Component({
  selector: 'app-news-simple',
  templateUrl: './news-simple.component.html',
  styleUrls: ['./news-simple.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsSimpleComponent {
  @Input() news: NewsSimpleInterface;
}
