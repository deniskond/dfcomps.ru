import { Component, Input, OnInit, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-rating-star',
  templateUrl: './rating-star.component.html',
  styleUrls: ['./rating-star.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingStarComponent implements OnChanges {
  @Input() fillValue: number;

  public fillWidth = '0px';

  ngOnChanges({ fillValue }: SimpleChanges): void {
    if (fillValue && this.fillValue) {
      let fillPx = Math.round(22 * this.fillValue);

      if (fillPx > 15 && this.fillValue !== 1) {
        fillPx = 15;
      }

      if (fillPx < 9 && this.fillValue !== 0) {
        fillPx = 9;
      }

      this.fillWidth = `${fillPx}px`;
    }
  }
}
