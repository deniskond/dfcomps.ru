import { PlayersRatingTableComponent } from '../components/players-rating-table/players-rating-table.component';
import { GmtDateTimeComponent } from '../components/gmt-date-time/gmt-date-time.component';
import { FlagComponent } from '../components/flag/flag.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingChangeComponent } from '../components/rating-change/rating-change.component';
import { PlayerCellComponent } from '../components/player-cell/player-cell.component';
import { MatRippleModule, MatTableModule } from '@angular/material';
import { WeaponsComponent } from '../components/weapons/weapons.component';
import { PlayerPlaceComponent } from '../components/player-place/player-place.component';
import { CdkTableModule } from '@angular/cdk/table';
import { YoutubeComponent } from '../components/youtube/youtube.component';

const COMPONENTS = [
    FlagComponent,
    RatingChangeComponent,
    PlayerCellComponent,
    WeaponsComponent,
    GmtDateTimeComponent,
    PlayerPlaceComponent,
    PlayersRatingTableComponent,
    YoutubeComponent,
];

@NgModule({
    declarations: COMPONENTS,
    imports: [CommonModule, MatRippleModule, MatTableModule, CdkTableModule],
    exports: COMPONENTS,
})
export class SharedModule {}
