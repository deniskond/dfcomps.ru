import { FlagComponent } from '../components/flag/flag.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingChangeComponent } from '../components/rating-change/rating-change.component';
import { PlayerCellComponent } from '../components/player-cell/player-cell.component';

const COMPONENTS = [FlagComponent, RatingChangeComponent, PlayerCellComponent];

@NgModule({
    declarations: COMPONENTS,
    imports: [CommonModule],
    exports: COMPONENTS,
})
export class SharedModule {}