import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import {
  hoverableCellAnimation,
  HOVERABLE_CELL_HOVERED_STATE,
  HOVERABLE_CELL_NORMAL_STATE,
  HOVERABLE_CELL_TRANSPARENT_HOVERED_STATE,
  HOVERABLE_CELL_TRANSPARENT_NORMAL_STATE,
} from './animations/hoverable-cell.animation';
import { Router } from '@angular/router';
import { PlayerCellStyles } from './enums/player-cell-styles.enum';

@Component({
  selector: 'app-player-cell',
  templateUrl: './player-cell.component.html',
  styleUrls: ['./player-cell.component.less'],
  animations: [hoverableCellAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCellComponent {
  @Input() country: string | null;
  @Input() nick: string;
  @Input() playerId: number;
  @Input() style = PlayerCellStyles.LIGHT;

  constructor(private router: Router) {}

  public hovered = false;
  public playerCellStyles = PlayerCellStyles;

  public darkenPlayerRow(): void {
    this.hovered = true;
  }

  public lightenPlayerRow(): void {
    this.hovered = false;
  }

  public getHoveredState(hovered: boolean, style: PlayerCellStyles): string {
    if (style === PlayerCellStyles.LIGHT) {
      return hovered ? HOVERABLE_CELL_HOVERED_STATE : HOVERABLE_CELL_NORMAL_STATE;
    }

    return hovered ? HOVERABLE_CELL_TRANSPARENT_HOVERED_STATE : HOVERABLE_CELL_TRANSPARENT_NORMAL_STATE;
  }

  public navigateToPlayerProfile(playerId: number): void {
    if (playerId) {
      this.router.navigate([`/profile/${playerId}`]);
    }
  }
}
