import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ArchiveService } from './services/archive/archive.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { range } from 'lodash';
import { switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Languages } from '~shared/enums/languages.enum';
import { LanguageService } from '~shared/services/language/language.service';
import { ArchiveNewsInterface } from '@dfcomps/contracts';

const NEWS_ON_PAGE = 50;

@Component({
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivePageComponent implements OnInit {
  public newsCount: number;
  public pagesCount: number;
  public allNews$: Observable<ArchiveNewsInterface[]>;
  public currentNews$: Observable<ArchiveNewsInterface[]>;
  public currentNewsRange$ = new BehaviorSubject<[number, number]>([0, NEWS_ON_PAGE]);
  public currentPage = 0;
  public currentFilter = 'all';
  public range = range;
  public language$: Observable<Languages>;
  public languages = Languages;
  private newsTypes: Record<string, number[]> = { 
    'all': [1, 2, 3, 4, 5, 6, 7, 8], 
    'result': [1, 5, 6, 7, 8], 
    'start': [2, 4],
    'other': [3] 
  }

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

    this.allNews$ = this.archiveService.getArchiveNews$(0, 9999);

    this.currentNews$ = this.currentNewsRange$.pipe(
      switchMap(([startIndex, endIndex]: [number, number]) =>
        startIndex || endIndex ? 
          this.allNews$.pipe(map(n => n.filter(i => n.indexOf(i) >= startIndex && n.indexOf(i) < endIndex)))
          : of([]),
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

  public filterNewsBy(filter: string): void {   
    this.currentFilter = filter; 
    const filteredNews = this.allNews$.pipe(map(arch => arch.filter(i => this.newsTypes[filter].includes(i.archiveNewsTypeId))));
    
    filteredNews.subscribe(fNews => {
      this.newsCount = fNews.length
      this.pagesCount = Math.ceil(fNews.length / NEWS_ON_PAGE);
    })

    this.changePagination(0);

    this.currentNews$ = this.currentNewsRange$.pipe(
      switchMap(([startIndex, endIndex]: [number, number]) =>
        startIndex || endIndex ? 
          filteredNews.pipe(map(arch => arch.filter(i => arch.indexOf(i) >= startIndex && arch.indexOf(i) < endIndex)))
          : of([]),
      ),
    );  
  }
}
