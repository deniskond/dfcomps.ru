import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrentSeasonService } from '@frontend/shared/rest-api';
import { BehaviorSubject, take, finalize } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';

@Component({
  selector: 'admin-season',
  templateUrl: './admin-season.component.html',
  styleUrls: ['./admin-season.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSeasonComponent implements OnInit {
  public currentSeason$ = new BehaviorSubject<number | null>(null);
  public isFinishingSeason = false;
  public isLoadingQuery = false;
  public currentFinishingStep = 1;

  constructor(
    private currentSeasonService: CurrentSeasonService,
    private adminDataService: AdminDataService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchCurrentSeason();
  }

  fetchCurrentSeason(): void {
    this.currentSeasonService
      .getCurrentSeason$()
      .pipe(take(1))
      .subscribe((season: number) => this.currentSeason$.next(season));
  }

  showEndSeasonButtons(): void {
    this.isFinishingSeason = true;
  }

  saveSeasonRatings(): void {
    this.isLoadingQuery = true;
    this.adminDataService
      .saveSeasonRatings$()
      .pipe(
        finalize(() => {
          this.isLoadingQuery = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe(() => {
        this.currentFinishingStep++;
        this.changeDetectorRef.markForCheck();
      });
  }

  setSeasonRewards(): void {
    this.isLoadingQuery = true;
    this.adminDataService
      .setSeasonRewards$()
      .pipe(
        finalize(() => {
          this.isLoadingQuery = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe(() => {
        this.currentFinishingStep++;
        this.changeDetectorRef.markForCheck();
      });
  }

  resetSeasonRatings(): void {
    this.isLoadingQuery = true;
    this.adminDataService
      .resetSeasonRatings$()
      .pipe(
        finalize(() => {
          this.isLoadingQuery = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe(() => {
        this.currentFinishingStep++;
        this.changeDetectorRef.markForCheck();
      });
  }

  incrementSeason(): void {
    this.isLoadingQuery = true;

    this.adminDataService
      .incrementSeason$()
      .pipe(
        finalize(() => {
          this.isLoadingQuery = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe(() => {
        this.currentSeason$.next(null);
        this.currentFinishingStep = 1;
        this.isFinishingSeason = false;
        this.fetchCurrentSeason();
      });
  }
}
