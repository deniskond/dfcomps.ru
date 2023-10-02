import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { switchMap, ReplaySubject, Subject } from 'rxjs';
import { range } from 'lodash';
import { take, finalize } from 'rxjs/operators';
import { CurrentSeasonService } from '~shared/rest-api';
import { RatingTablesService } from '~shared/services/rating-tables-service/rating-tables-service';
import { LeaderTableInterface, Physics } from '@dfcomps/contracts';

const MAX_PLAYERS_PER_PAGE = 100;

@Component({
  templateUrl: './rating.page.html',
  styleUrls: ['./rating.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingPageComponent implements OnInit {
  public currentPage = 1;
  public selectedSeason: number;
  public currentSeason$ = new ReplaySubject<number>(1);
  public vq3Ratings$ = new ReplaySubject<LeaderTableInterface[]>(1);
  public cpmRatings$ = new ReplaySubject<LeaderTableInterface[]>(1);
  public pagesCount$ = new ReplaySubject<number>(1);
  public range = range;
  public isLoadingVq3$ = new Subject<boolean>();
  public isLoadingCpm$ = new Subject<boolean>();
  public bias = 0;

  constructor(
    private ratingTablesService: RatingTablesService,
    private changeDetectorRef: ChangeDetectorRef,
    private currentSeasonService: CurrentSeasonService,
  ) {}

  ngOnInit(): void {
    this.loadCurrentSeason();
    this.loadCurrentSeasonPage(this.currentPage);
  }

  public loadCurrentSeasonPage(page: number): void {
    this.isLoadingVq3$.next(true);
    this.isLoadingCpm$.next(true);
    this.currentPage = page;
    this.bias = (page - 1) * MAX_PLAYERS_PER_PAGE;

    this.ratingTablesService
      .getRatingTablePagesCount$()
      .pipe(take(1))
      .subscribe((pagesCount: number) => {
        this.pagesCount$.next(pagesCount);
        this.changeDetectorRef.markForCheck();
      });

    this.ratingTablesService
      .getRatingTablePage$(Physics.VQ3, page)
      .pipe(
        take(1),
        finalize(() => this.isLoadingVq3$.next(false)),
      )
      .subscribe((ratingTable: LeaderTableInterface[]) => this.vq3Ratings$.next(ratingTable));

    this.ratingTablesService
      .getRatingTablePage$(Physics.CPM, page)
      .pipe(
        take(1),
        finalize(() => this.isLoadingCpm$.next(false)),
      )
      .subscribe((ratingTable: LeaderTableInterface[]) => this.cpmRatings$.next(ratingTable));
  }

  public loadPreviousSeasonPage(page: number): void {
    this.isLoadingVq3$.next(true);
    this.isLoadingCpm$.next(true);
    this.currentPage = page;
    this.bias = (page - 1) * MAX_PLAYERS_PER_PAGE;

    this.ratingTablesService
      .getSeasonRatingTablePagesCount$(this.selectedSeason)
      .pipe(take(1))
      .subscribe((pagesCount: number) => this.pagesCount$.next(pagesCount));

    this.ratingTablesService
      .getSeasonRatingTablePage$(Physics.VQ3, page, this.selectedSeason)
      .pipe(
        take(1),
        finalize(() => this.isLoadingVq3$.next(false)),
      )
      .subscribe((ratingTable: LeaderTableInterface[]) => this.vq3Ratings$.next(ratingTable));

    this.ratingTablesService
      .getSeasonRatingTablePage$(Physics.CPM, page, this.selectedSeason)
      .pipe(
        take(1),
        finalize(() => this.isLoadingCpm$.next(false)),
      )
      .subscribe((ratingTable: LeaderTableInterface[]) => this.cpmRatings$.next(ratingTable));
  }

  public setSeason(season: number): void {
    this.selectedSeason = season;

    this.currentSeason$
      .pipe(take(1))
      .subscribe((currentSeason: number) =>
        season === currentSeason ? this.loadCurrentSeasonPage(1) : this.loadPreviousSeasonPage(1),
      );
  }

  public getRange(count: number): Array<null> {
    return new Array(count).fill(null);
  }

  private loadCurrentSeason(): void {
    this.currentSeasonService.getCurrentSeason$().subscribe((currentSeason: number) => {
      this.selectedSeason = currentSeason;
      this.currentSeason$.next(currentSeason);
    });
  }
}
