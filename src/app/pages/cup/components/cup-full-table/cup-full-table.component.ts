import { Physics } from '../../../../enums/physics.enum';
import { PlayerCellStyles } from '../../../../components/player-cell/enums/player-cell-styles.enum';
import { CupSystems } from '../../../../enums/cup-systems.enum';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MulticupTableInterface } from '../../interfaces/multicup-table.interface';

@Component({
    selector: 'app-cup-full-table',
    templateUrl: './cup-full-table.component.html',
    styleUrls: ['./cup-full-table.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CupFullTableComponent {
    @Input()
    fullTable: MulticupTableInterface;
    @Input()
    physics: Physics;

    public playerCellStyles = PlayerCellStyles;
    public cupSystems = CupSystems;
    public range = (n: string) => new Array(+n).fill(null);

    public navigateToRound(round: number): void {}
}
