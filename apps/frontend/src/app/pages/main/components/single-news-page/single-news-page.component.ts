import { NewsTypes } from '../../../../enums/news-types.enum';
import { NewsService } from '../../../../services/news-service/news.service';
import { NewsInterfaceUnion } from '../../../../types/news-union.type';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject, EMPTY, combineLatest } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { tap, switchMap, catchError, takeUntil, startWith, map } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-single-news-page',
  templateUrl: './single-news-page.component.html',
  styleUrls: ['./single-news-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleNewsPageComponent implements OnInit, OnDestroy {
  public singleNews$: Observable<NewsInterfaceUnion>;
  public hasError = false;
  public newsTypes = NewsTypes;

  private reloadNews$ = new Subject<null>();
  private onDestroy$ = new Subject<void>();

  constructor(private activatedRoute: ActivatedRoute, private newsService: NewsService) {}

  ngOnInit(): void {
    this.singleNews$ = combineLatest([this.activatedRoute.params, this.reloadNews$.pipe(startWith(null))]).pipe(
      tap(([_]: [Params, null]) => (this.hasError = false)),
      map(([params]: [Params, null]) => params),
      switchMap(({ id }: Params) => this.newsService.getSingleNews$(id)),
      catchError(() => {
        this.hasError = true;

        return EMPTY;
      }),
      takeUntil(this.onDestroy$),
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.reloadNews$.complete();
  }

  public formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY HH:mm');
  }

  public reloadNews(): void {
    this.reloadNews$.next(null);
  }
}
