import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ArchiveService } from './services/archive/archive.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { range } from 'lodash';
import { switchMap } from 'rxjs/operators';
import { ArchiveNewsInterface } from './interfaces/archive-news.interface';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Languages } from '~shared/enums/languages.enum';
import { LanguageService } from '~shared/services/language/language.service';

const NEWS_ON_PAGE = 50;

@Component({
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivePageComponent implements OnInit {
  public newsCount: number;
  public pagesCount: number;
  public news$: Observable<ArchiveNewsInterface[]>;
  public currentNewsRange$ = new BehaviorSubject<[number, number]>([0, NEWS_ON_PAGE]);
  public currentPage = 0;
  public range = range;
  public language$: Observable<Languages>;
  public languages = Languages;

  constructor(
    private router: Router,
    private archiveService: ArchiveService,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.archiveService.getNewsCount$().subscribe((count: number) => {
      this.newsCount = count;
      this.pagesCount = Math.ceil(count / NEWS_ON_PAGE);
      this.changeDetectorRef.markForCheck();
    });

    this.news$ = this.currentNewsRange$.pipe(
      switchMap(([startIndex, endIndex]: [number, number]) =>
        startIndex || endIndex ? this.archiveService.getArchiveNews$(startIndex, endIndex) : of([]),
      ),
    );

    this.language$ = this.languageService.getLanguage$();
  }

  public navigateToNewsPage(newsId: number): void {
    this.router.navigate([`/news/${newsId}`]);
  }

  public changePagination(page: number): void {
    this.currentPage = page;
    this.currentNewsRange$.next([0, 0]);
    this.currentNewsRange$.next([page * NEWS_ON_PAGE, (page + 1) * NEWS_ON_PAGE]);
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }
}
