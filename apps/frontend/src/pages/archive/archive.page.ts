import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ArchiveService } from './services/archive/archive.service';
import { range } from 'lodash';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Languages } from '~shared/enums/languages.enum';
import { LanguageService } from '~shared/services/language/language.service';
import { ArchiveNewsFilter, ArchiveNewsInterface, ArchiveNewsResultInterface } from '@dfcomps/contracts';

const NEWS_ON_PAGE = 50;

@Component({
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivePageComponent implements OnInit {
  public newsCount: number;
  public pagesCount: number;
  public news: ArchiveNewsInterface[] = [];
  public languages = Languages;
  public currentPage = 0;
  public range = range;
  public language: Languages;
  public currentFilter = ArchiveNewsFilter.ALL;
  public archiveNewsFilter = ArchiveNewsFilter;

  constructor(
    private router: Router,
    private archiveService: ArchiveService,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchNews();

    this.languageService
      .getLanguage$()
      .pipe(take(1))
      .subscribe((language: Languages) => {
        this.language = language;
        this.changeDetectorRef.markForCheck();
      });
  }

  public navigateToNewsPage(newsId: number): void {
    this.router.navigate([`/news/${newsId}`]);
  }

  public changePagination(page: number): void {
    this.currentPage = page;
    this.fetchNews();
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }

  public filterNewsBy(filter: ArchiveNewsFilter): void {
    this.currentFilter = filter;
  }

  private fetchNews(): void {
    this.archiveService
      .getArchiveNews$(this.currentPage * NEWS_ON_PAGE, (this.currentPage + 1) * NEWS_ON_PAGE)
      .subscribe(({ resultsCount, news }: ArchiveNewsResultInterface) => {
        this.news = news;
        this.pagesCount = Math.ceil(resultsCount / NEWS_ON_PAGE);
        this.changeDetectorRef.markForCheck();
      });
  }
}
