import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { switchMap, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { take, finalize } from 'rxjs/operators';
import { CurrentSeasonService } from '~shared/rest-api';
import { RatingTablesService } from '~shared/services/rating-tables-service/rating-tables-service';
import { LanguageService } from '~shared/services/language/language.service';
import { getSeasonName } from '~shared/helpers';
import { LeaderTableInterface, Physics } from '@dfcomps/contracts';

const MAX_PLAYERS_PER_PAGE = 100;

@Component({
  templateUrl: './rating.page.html',
  styleUrls: ['./rating.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class RatingPageComponent implements OnInit, OnDestroy {
  public currentPage = 1;
  public selectedSeason: number;
  public currentSeason: number;
  public vq3Ratings$ = new ReplaySubject<LeaderTableInterface[]>(1);
  public cpmRatings$ = new ReplaySubject<LeaderTableInterface[]>(1);
  public pagesCount$ = new ReplaySubject<number>(1);
  public isLoadingVq3$ = new Subject<boolean>();
  public isLoadingCpm$ = new Subject<boolean>();
  public bias = 0;

  private translations: Record<string, string> = {};
  private onDestroy$ = new Subject<void>();

  constructor(
    private ratingTablesService: RatingTablesService,
    private changeDetectorRef: ChangeDetectorRef,
    private currentSeasonService: CurrentSeasonService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.loadCurrentSeason();
    this.loadCurrentSeasonPage(this.currentPage);
    this.languageService
      .getTranslations$()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((translations: Record<string, string>) => {
        this.translations = translations;
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public getSeasonLinkLabel(season: number): string {
    return getSeasonName(season) ?? `${this.translations['season']} ${season}`;
  }

  public getSeasonHeaderLabel(season: number): string {
    return getSeasonName(season) ?? `${season}`;
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
      .subscribe((ratingTable: LeaderTableInterface[]) => {
        this.vq3Ratings$.next(ratingTable);
        this.changeDetectorRef.markForCheck();
      });

    this.ratingTablesService
      .getRatingTablePage$(Physics.CPM, page)
      .pipe(
        take(1),
        finalize(() => this.isLoadingCpm$.next(false)),
      )
      .subscribe((ratingTable: LeaderTableInterface[]) => {
        this.cpmRatings$.next(ratingTable);
        this.changeDetectorRef.markForCheck();
      });
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
    this.currentSeason === season ? this.loadCurrentSeasonPage(1) : this.loadPreviousSeasonPage(1);
  }

  public onPageChange(page: number): void {
    const targetPage = page + 1;

    this.currentSeason === this.selectedSeason
      ? this.loadCurrentSeasonPage(targetPage)
      : this.loadPreviousSeasonPage(targetPage);
  }

  private loadCurrentSeason(): void {
    this.currentSeasonService.getCurrentSeason$().subscribe((currentSeason: number) => {
      this.selectedSeason = currentSeason;
      this.currentSeason = currentSeason;
      this.changeDetectorRef.markForCheck();
    });
  }
}
