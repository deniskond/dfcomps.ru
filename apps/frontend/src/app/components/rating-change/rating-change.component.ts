import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-rating-change',
  templateUrl: './rating-change.component.html',
  styleUrls: ['./rating-change.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingChangeComponent implements OnInit {
  @Input()
  change: string;
  @Input()
  zeroIfNull = false;

  public defaultValue: string;

  ngOnInit(): void {
    this.defaultValue = this.zeroIfNull ? '0' : '-';
  }
}
