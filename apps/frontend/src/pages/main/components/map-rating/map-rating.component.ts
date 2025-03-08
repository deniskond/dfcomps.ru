import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { Languages } from '@dfcomps/contracts';
import { combineLatest, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { LanguageService } from '~shared/services/language/language.service';

const DEFAULT_RATING = 3;

enum MapRatingComponentState {
  USER_VOTED,
  WAITING_FOR_VOTE,
}

@Component({
  selector: 'app-map-rating',
  templateUrl: './map-rating.component.html',
  styleUrls: ['./map-rating.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapRatingComponent implements OnInit, OnDestroy {
  @Input() isUserVoted: boolean;
  @Input() rating: number;
  @Input() userVoteValue: number;

  public componentState: MapRatingComponentState;
  public componentStates = MapRatingComponentState;
  public ratingValues: number[] = [];
  public selectedRating: number;
  public isRequestInProcess = false;
  public tooltipContent: string;
  public userVoteValue$ = new ReplaySubject<number>();

  private onDestroy$ = new Subject<void>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    if (this.isUserVoted) {
      this.componentState = MapRatingComponentState.USER_VOTED;
      this.selectedRating = this.rating;
    } else {
      this.componentState = MapRatingComponentState.WAITING_FOR_VOTE;
      this.selectedRating = DEFAULT_RATING;
    }

    this.setRatingValues(this.selectedRating);
    this.setLanguageServiceSubscription();

    if (this.userVoteValue) {
      this.userVoteValue$.next(this.userVoteValue);
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public onStarHover(index: number): void {
    this.setRatingValues(index + 1);
  }

  public onStarClick(index: number): void {
    this.selectedRating = index + 1;
  }

  public resetToSelectedRating(): void {
    this.setRatingValues(this.selectedRating);
  }

  public onVoteSubmit(): void {
    // this.isRequestInProcess = true;

    this.componentState = MapRatingComponentState.USER_VOTED;
    this.userVoteValue$.next(this.selectedRating);
    this.selectedRating = this.rating;
    this.setRatingValues(this.selectedRating);
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
      .subscribe(([userVote, language]: [number, Languages]) => {
        if (language === Languages.RU) {
          this.tooltipContent = `Ваш голос: ${userVote}\nПри подсчете среднего значения голоса участников турнира учитываются за 2 голоса`;
        }

        if (language === Languages.EN) {
          this.tooltipContent = `Your vote: ${userVote}\nWhen calculating the average rating, each participant's vote counts as 2 votes.`;
        }
      });
  }
}
