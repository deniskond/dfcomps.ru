import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ArchiveService } from './services/archive/archive.service';
import { range } from 'lodash';
import { take, takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { LanguageService } from '~shared/services/language/language.service';
import { ArchiveNewsFilter, ArchiveNewsInterface, ArchiveNewsResultInterface, Languages } from '@dfcomps/contracts';
import { Subject } from 'rxjs';

const NEWS_ON_PAGE = 50;

@Component({
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivePageComponent implements OnInit, OnDestroy {
  public newsCount: number;
  public pagesCount: number;
  public news: ArchiveNewsInterface[] = [];
  public languages = Languages;
  public currentPage = 0;
  public range = range;
  public language: Languages;
  public currentFilter = ArchiveNewsFilter.ALL;
  public archiveNewsFilter = ArchiveNewsFilter;

  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private archiveService: ArchiveService,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe((params) => {
      if (params['pageNumber']) {
        this.currentPage = parseInt(params['pageNumber']) - 1;
      }
      if (params['filterType']) {
        const filterType = params['filterType'].toLowerCase();

        if (Object.values(ArchiveNewsFilter).includes(filterType as ArchiveNewsFilter)) {
          this.currentFilter = filterType as ArchiveNewsFilter;
        }
      }
      this.fetchNews();
    });

    this.languageService
      .getLanguage$()
      .pipe(take(1))
      .subscribe((language: Languages) => {
        this.language = language;
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public navigateToNewsPage(newsId: number): void {
    this.router.navigate([`/news/${newsId}`]);
  }

  public changePagination(page: number): void {
    if (this.currentFilter === ArchiveNewsFilter.ALL) {
      this.router.navigate(['/archive', 'page', page + 1]);
    } else {
      this.router.navigate(['/archive', 'filter', this.currentFilter, 'page', page + 1]);
    }
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }

  public getPaginationLink(page: number): string[] {
    if (this.currentFilter === ArchiveNewsFilter.ALL) {
      return ['/archive', 'page', (page + 1).toString()];
    }
    return ['/archive', 'filter', this.currentFilter, 'page', (page + 1).toString()];
  }

  public filterNewsBy(filter: ArchiveNewsFilter): void {
    this.currentFilter = filter;
    if (filter === ArchiveNewsFilter.ALL) {
      this.router.navigate(['/archive']);
    } else {
      this.router.navigate(['/archive', 'filter', filter]);
    }
  }

  private fetchNews(): void {
    this.archiveService
      .getArchiveNews$(this.currentPage * NEWS_ON_PAGE, (this.currentPage + 1) * NEWS_ON_PAGE, this.currentFilter)
      .subscribe(({ resultsCount, news }: ArchiveNewsResultInterface) => {
        this.news = news;
        this.pagesCount = Math.ceil(resultsCount / NEWS_ON_PAGE);
        this.changeDetectorRef.markForCheck();
      });
  }
}
