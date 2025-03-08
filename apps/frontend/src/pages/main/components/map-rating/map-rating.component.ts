import { Component, ChangeDetectionStrategy, Input, SimpleChanges, OnChanges, OnInit } from '@angular/core';

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
export class MapRatingComponent implements OnInit, OnChanges {
  @Input() isUserVoted: boolean;
  @Input() rating: number;

  public componentState: MapRatingComponentState;
  public componentStates = MapRatingComponentState;
  public ratingValues: number[] = [];
  public selectedRating: number;

  ngOnInit(): void {
    if (this.isUserVoted) {
      this.componentState = MapRatingComponentState.USER_VOTED;
      this.selectedRating = this.rating;
    } else {
      this.componentState = MapRatingComponentState.WAITING_FOR_VOTE;
      this.selectedRating = DEFAULT_RATING;
    }

    this.setRatingValues(this.selectedRating);
  }

  ngOnChanges({ rating }: SimpleChanges): void {
    if (rating && this.rating && this.isUserVoted) {
    }
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
}
