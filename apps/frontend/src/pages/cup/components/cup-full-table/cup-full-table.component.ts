import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { MulticupTableInterface } from '../../interfaces/multicup-table.interface';
import { PlayerCellStyles } from '~shared/components/player-cell/enums/player-cell-styles.enum';
import { getTablePlaces } from '~shared/helpers/table-places.helper';
import { MulticupResultInterface, MulticupSystems, Physics } from '@dfcomps/contracts';

@Component({
  selector: 'app-cup-full-table',
  templateUrl: './cup-full-table.component.html',
  styleUrls: ['./cup-full-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupFullTableComponent implements OnChanges {
  @Input()
  fullTable: MulticupTableInterface;
  @Input()
  physics: Physics;
  @Output()
  navigateToRound = new EventEmitter<number>();

  public playerCellStyles = PlayerCellStyles;
  public places: number[];
  public roundsCount: number;
  public range = (n: string) => new Array(+n).fill(null);

  ngOnChanges({ fullTable }: SimpleChanges): void {
    if (fullTable && fullTable.currentValue) {
      this.places = getTablePlaces(this.fullTable.players.map(({ overall }: MulticupResultInterface) => +overall));

      this.roundsCount = +this.fullTable.rounds + 1;
    }
  }

  get isEESystem(): boolean {
    return (
      !!this.fullTable &&
      [MulticupSystems.EE_ALMERA, MulticupSystems.EE_DFWC, MulticupSystems.EE_KOZ].includes(this.fullTable.system)
    );
  }

  getPlayerRoundResult(roundResult: string | null): string {
    if (roundResult === null) {
      return '-';
    }

    return roundResult;
  }
}
