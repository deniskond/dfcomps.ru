import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MulticupResultInterface } from '../../../../../pages/cup/interfaces/multicup-result.interface';
import { getTablePlaces } from '~shared/helpers/table-places.helper';
import { Physics } from '@dfcomps/contracts';

@Component({
  selector: 'app-multicup-physics-table',
  templateUrl: './multicup-physics-table.component.html',
  styleUrls: ['./multicup-physics-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MulticupPhysicsTableComponent implements OnInit {
  @Input() physics: Physics;
  @Input() physicsTable: MulticupResultInterface[];
  @Input() multicupId: string;
  @Input() tableCellsCount: number;

  public places: number[];
  public emptyCells: null[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.places = getTablePlaces(this.physicsTable.map(({ overall }: MulticupResultInterface) => overall));

    if (this.physicsTable.length < this.tableCellsCount) {
      this.emptyCells = new Array(this.tableCellsCount - this.physicsTable.length).fill(null);
    }
  }

  public navigateToMultiCup(): void {
    this.router.navigate(['cup/multi'], { queryParams: { id: this.multicupId, physics: this.physics } });
  }
}
