import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NewsStreamInterface, StreamingPlatforms } from '@dfcomps/contracts';

@Component({
  selector: 'app-news-streams',
  templateUrl: './news-streams.component.html',
  styleUrls: ['./news-streams.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsStreamsComponent {
  @Input() streams: NewsStreamInterface[];

  public streamingPlatforms = StreamingPlatforms;
}
