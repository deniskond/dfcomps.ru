import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { getTablePlaces } from '../../helpers/table-places.helper';
import { LeaderTableInterface } from '@dfcomps/contracts';

@Component({
  selector: 'app-players-rating-table',
  templateUrl: './players-rating-table.component.html',
  styleUrls: ['./players-rating-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayersRatingTableComponent implements OnInit {
  @Input()
  ratingTable: LeaderTableInterface[];
  @Input()
  bias = 0;

  public ratingTableWithPositions: LeaderTableInterface[];

  ngOnInit(): void {
    const places = getTablePlaces(this.ratingTable.map(({ rating }: LeaderTableInterface) => +rating));

    this.ratingTableWithPositions = this.ratingTable.map((row: LeaderTableInterface, index: number) => ({
      ...row,
      position: places[index] + this.bias,
    }));
  }
}
