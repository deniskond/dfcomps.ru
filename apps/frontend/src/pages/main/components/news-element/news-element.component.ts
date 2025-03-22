import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Languages, NewsInterfaceUnion, NewsTypes } from '@dfcomps/contracts';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { LanguageService } from '~shared/services/language/language.service';

@Component({
  selector: 'app-news-element',
  templateUrl: './news-element.component.html',
  styleUrls: ['./news-element.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsElementComponent implements OnInit {
  @Input() newsElement: NewsInterfaceUnion;
  @Input() isHeaderSelectable: boolean;
  @Input() areCommentsExpanded: boolean;

  @Output()
  reloadNews = new EventEmitter<void>();

  public newsTypes = NewsTypes;
  public languages = Languages;
  public language$: Observable<Languages>;
  public showStreamsOnTop: boolean;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.language$ = this.languageService.getLanguage$();

    this.showStreamsOnTop =
      !this.newsElement.image &&
      !!this.newsElement.streams.length &&
      this.newsElement.type !== NewsTypes.STREAMERS_RESULTS;
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }

  public getImageSrc(imageTimestamp: string): string {
    return `/uploads/images/news/${imageTimestamp}.jpg`;
  }
}
