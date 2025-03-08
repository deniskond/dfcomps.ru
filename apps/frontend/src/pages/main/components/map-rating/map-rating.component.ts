import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Languages, MapRatingInterface } from '@dfcomps/contracts';
import { combineLatest, finalize, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { CupsService } from '~shared/services/cups/cups.service';
import { LanguageService } from '~shared/services/language/language.service';

const DEFAULT_RATING = 3;

enum MapRatingComponentState {
  WAITING_FOR_VOTE,
  VOTE_CLOSED,
  VOTE_CLOSED_WITH_NO_VOTES,
}

@Component({
  selector: 'app-map-rating',
  templateUrl: './map-rating.component.html',
  styleUrls: ['./map-rating.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapRatingComponent implements OnInit, OnDestroy {
  @Input() rating: number | null;
  @Input() userVoteValue: number | null;
  @Input() isVotingAvailable: boolean;
  @Input() cupId: number;

  public componentState: MapRatingComponentState;
  public componentStates = MapRatingComponentState;
  public ratingValues: number[] = [];
  public selectedRating: number;
  public isRequestInProcess = false;
  public tooltipContent: string;
  public userVoteValue$ = new ReplaySubject<number | null>();

  private onDestroy$ = new Subject<void>();

  constructor(
    private languageService: LanguageService,
    private cupsService: CupsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.userVoteValue || !this.isVotingAvailable) {
      if (this.rating) {
        this.userVoteValue$.next(this.userVoteValue);
        this.componentState = MapRatingComponentState.VOTE_CLOSED;
        this.selectedRating = this.rating;
      } else {
        this.componentState = MapRatingComponentState.VOTE_CLOSED_WITH_NO_VOTES;
      }
    } else {
      this.componentState = MapRatingComponentState.WAITING_FOR_VOTE;
      this.selectedRating = DEFAULT_RATING;
    }

    this.setRatingValues(this.selectedRating);
    this.setLanguageServiceSubscription();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public onStarHover(index: number): void {
    if (this.componentState === MapRatingComponentState.VOTE_CLOSED) {
      return;
    }

    this.setRatingValues(index + 1);
  }

  public onStarClick(index: number): void {
    if (this.componentState === MapRatingComponentState.VOTE_CLOSED) {
      return;
    }

    this.selectedRating = index + 1;
  }

  public resetToSelectedRating(): void {
    this.setRatingValues(this.selectedRating);
  }

  public onVoteSubmit(): void {
    this.isRequestInProcess = true;
    this.userVoteValue$.next(this.selectedRating);

    this.cupsService
      .reviewMap$(this.cupId, this.selectedRating)
      .pipe(
        finalize(() => {
          this.isRequestInProcess = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe(({ mapRating }: MapRatingInterface) => {
        this.componentState = MapRatingComponentState.VOTE_CLOSED;
        this.selectedRating = mapRating;
        this.setRatingValues(this.selectedRating);
        this.changeDetectorRef.markForCheck();
      });
  }

  private setRatingValues(rating: number): void {
    const result = [0, 0, 0, 0, 0];

    for (let i = 0; i < 5; i++) {
      if (rating >= i + 1) {
        result[i] = 1;
      } else if (rating > i) {
        result[i] = parseFloat((rating - i).toFixed(2));
      }
    }

    this.ratingValues = result;
  }

  private setLanguageServiceSubscription(): void {
    combineLatest([this.userVoteValue$, this.languageService.getLanguage$()])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([userVote, language]: [number | null, Languages]) => {
        if (language === Languages.RU) {
          const yourVoteText = userVote ? `Ваш голос: ${userVote}\n` : '';

          this.tooltipContent = `${yourVoteText}При подсчете среднего значения голоса участников турнира учитываются за 2 голоса`;
        }

        if (language === Languages.EN) {
          const yourVoteText = userVote ? `Your vote: ${userVote}\n` : '';

          this.tooltipContent = `${yourVoteText}When calculating the average rating, each participant's vote counts as 2 votes.`;
        }
      });
  }
}
