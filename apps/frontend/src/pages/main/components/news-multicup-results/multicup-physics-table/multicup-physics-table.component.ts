import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { getTablePlaces } from '~shared/helpers/table-places.helper';
import { MulticupResultInterface, Physics } from '@dfcomps/contracts';

const MAX_PLAYERS_IN_TABLE = 30;

@Component({
  selector: 'app-multicup-physics-table',
  templateUrl: './multicup-physics-table.component.html',
  styleUrls: ['./multicup-physics-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MulticupPhysicsTableComponent implements OnInit {
  @Input() physics: Physics;
  @Input() physicsTable: MulticupResultInterface[];
  @Input() multicupId: number;
  @Input() tableCellsCount: number;

  public slicedPhysicsTable: MulticupResultInterface[];
  public places: number[];
  public emptyCells: null[] = [];
  public hasRatingChange: boolean;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.hasRatingChange = this.physicsTable[0].ratingChange !== null;
    this.slicedPhysicsTable = this.physicsTable.slice(0, MAX_PLAYERS_IN_TABLE);
    this.places = getTablePlaces(this.slicedPhysicsTable.map(({ overall }: MulticupResultInterface) => overall));

    const actualTableCellsCount = this.tableCellsCount > MAX_PLAYERS_IN_TABLE ? MAX_PLAYERS_IN_TABLE : this.tableCellsCount;

    if (this.physicsTable.length < actualTableCellsCount) {
      this.emptyCells = new Array(actualTableCellsCount - this.physicsTable.length).fill(null);
    }
  }

  public navigateToMultiCup(): void {
    this.router.navigate(['cup/multi'], { queryParams: { id: this.multicupId, physics: this.physics } });
  }
}
