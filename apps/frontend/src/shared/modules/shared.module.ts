import { PlayersRatingTableComponent } from '../components/players-rating-table/players-rating-table.component';
import { GmtDateTimeComponent } from '../components/gmt-date-time/gmt-date-time.component';
import { FlagComponent } from '../components/flag/flag.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingChangeComponent } from '../components/rating-change/rating-change.component';
import { PlayerCellComponent } from '../components/player-cell/player-cell.component';
import { MatRippleModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { WeaponsComponent } from '../components/weapons/weapons.component';
import { PlayerPlaceComponent } from '../components/player-place/player-place.component';
import { CdkTableModule } from '@angular/cdk/table';
import { YoutubeComponent } from '../components/youtube/youtube.component';
import { InvokeFunctionPipe } from '../pipe/invoke-function.pipe';
import { ClickOutsideDirective } from '../directives/click-outside/click-outside.directive';
import { SmileComponent } from '../components/smile/smile.component';
import { TranslateDirective } from '../directives/translate/translate.directive';
import { BigFlagComponent } from '../components/big-flag/big-flag.component';
import { TwitchComponent } from '~shared/components/twitch/twitch.component';

const COMPONENTS = [
  FlagComponent,
  RatingChangeComponent,
  PlayerCellComponent,
  WeaponsComponent,
  GmtDateTimeComponent,
  PlayerPlaceComponent,
  PlayersRatingTableComponent,
  YoutubeComponent,
  SmileComponent,
  BigFlagComponent,
  TwitchComponent,
];

const DIRECTIVES = [ClickOutsideDirective, TranslateDirective];

const PIPES = [InvokeFunctionPipe];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  imports: [CommonModule, MatRippleModule, MatTableModule, CdkTableModule],
  exports: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
})
export class SharedModule {}
