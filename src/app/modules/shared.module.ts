import { GmtDateTimeComponent } from '../components/gmt-date-time/gmt-date-time.component';
import { FlagComponent } from '../components/flag/flag.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingChangeComponent } from '../components/rating-change/rating-change.component';
import { PlayerCellComponent } from '../components/player-cell/player-cell.component';
import { MatRippleModule } from '@angular/material';
import { WeaponsComponent } from '../components/weapons/weapons.component';
import { PlayerPlaceComponent } from '../components/player-place/player-place.component';

const COMPONENTS = [
    FlagComponent,
    RatingChangeComponent,
    PlayerCellComponent,
    WeaponsComponent,
    GmtDateTimeComponent,
    PlayerPlaceComponent,
];

@NgModule({
    declarations: COMPONENTS,
    imports: [CommonModule, MatRippleModule],
    exports: COMPONENTS,
})
export class SharedModule {}
