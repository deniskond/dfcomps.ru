import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { MulticupRoundInterface } from '../../interfaces/multicup-round.interface';
import { MulticupRoundResultInterface } from '../../interfaces/multicup-round-result.interface';
import { PlayerCellStyles } from '~shared/components/player-cell/enums/player-cell-styles.enum';
import { formatResultTime } from '~shared/helpers/result-time.helper';
import { getTablePlaces } from '~shared/helpers/table-places.helper';

@Component({
  selector: 'app-cup-round',
  templateUrl: './cup-round.component.html',
  styleUrls: ['./cup-round.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupRoundComponent implements OnChanges {
  @Input()
  round: MulticupRoundInterface;
  @Input()
  roundNumber: number;

  public playerCellStyles = PlayerCellStyles;
  public places: number[];

  ngOnChanges({ round }: SimpleChanges): void {
    if (round && round.currentValue) {
      this.places = getTablePlaces(this.round.resultsTable.map(({ points }: MulticupRoundResultInterface) => +points!));
    }
  }

  public getFormattedTime(time: string): string {
    return formatResultTime(time);
  }
}
