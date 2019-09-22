import { PlayerCellStyles } from '../../../../components/player-cell/enums/player-cell-styles.enum';
import { Component, Input } from '@angular/core';
import { MulticupRoundInterface } from '../../interfaces/multicup-round.interface';

@Component({
    selector: 'app-cup-round',
    templateUrl: './cup-round.component.html',
    styleUrls: ['./cup-round.component.less'],
})
export class CupRoundComponent {
    @Input()
    round: MulticupRoundInterface;

    public playerCellStyles = PlayerCellStyles;
}
