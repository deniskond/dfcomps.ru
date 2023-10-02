import { RatingTablesService } from '../../services/rating-tables-service/rating-tables-service';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { LeaderTableInterface, Physics, RatingTablesModes } from '@dfcomps/contracts';

@Component({
  selector: 'app-top-ten-table',
  templateUrl: './top-ten-table.component.html',
  styleUrls: ['./top-ten-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopTenTableComponent implements OnInit {
  @Input()
  physics: Physics;

  @Input()
  mode: RatingTablesModes = RatingTablesModes.CLASSIC;

  constructor(private ratingTablesService: RatingTablesService) {}

  public topTenTable$: Observable<LeaderTableInterface[]>;
  public hoveredCells: boolean[] = [];

  ngOnInit(): void {
    this.topTenTable$ = this.ratingTablesService.getTop10Table$(this.physics, this.mode);
  }
}
