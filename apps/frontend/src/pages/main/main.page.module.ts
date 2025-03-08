import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main.page';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NewsOnlineResultsComponent } from './components/news-online-results/news-online-results.component';
import { NewsOnlineAnnounceComponent } from './components/news-online-announce/news-online-announce.component';
import { NewsOfflineResultsComponent } from './components/news-offline-results/news-offline-results.component';
import { NewsOfflineStartComponent } from './components/news-offline-start/news-offline-start.component';
import { NewsSimpleComponent } from './components/news-simple/news-simple.component';
import { NewsMulticupResultsComponent } from './components/news-multicup-results/news-multicup-results.component';
import { HtmlNewsComponent } from './components/html-news/html-news.component';
import { MulticupPhysicsTableComponent } from './components/news-multicup-results/multicup-physics-table/multicup-physics-table.component';
import { NewsPhysicsTableComponent } from './components/news-offline-results/news-physics-table/news-physics-table.component';
import { NewsOnlineResultsTableComponent } from './components/news-online-results/online-results-table/online-results-table.component';
import { NewsCommentsComponent } from './components/news-comments/news-comments.component';
import { ValidationDialogComponent } from './components/news-offline-start/validation-dialog/validation-dialog.component';
import { PlayerDemosDialogComponent } from './components/news-offline-start/player-demos-dialog/player-demos-dialog.component';
import { SingleNewsPageComponent } from './components/single-news-page/single-news-page.component';
import { InvalidDemosListComponent } from './components/news-offline-results/invalid-demos-list/invalid-demos-list.component';
import { NewsDfwcResultsComponent } from './components/news-dfwc-results/news-dfwc-results.component';
import { ModeratorDeleteCommentDialogComponent } from './components/news-comments/components/moderator-delete-comment-dialog/moderator-delete-comment-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SmilesDropdownComponent } from './components/news-comments/components/smiles-dropdown/smiles-dropdown.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { NewsSocialLinksComponent } from './components/news-social-links/news-social-links.component';
import { NewsCommentTextComponent } from './components/news-comments/components/news-comment-text/news-comment-text.component';
import { OverbouncesWarningDialogComponent } from './components/news-offline-start/overbounces-warning-dialog/overbounces-warning-dialog.component';
import { SDCRulesDialogComponent } from './components/news-offline-start/sdc-rules-dialog/sdc-rules-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '~shared/modules/shared.module';
import { NewsService } from '~shared/services/news-service/news.service';
import { ThemeNewsPageComponent } from './components/theme-news-page/theme-news-page.component';
import { NewsStreamersResultsComponent } from './components/news-streamers-results/news-streamers-results.component';
import { NewsElementComponent } from './components/news-element/news-element.component';
import { NewsStreamsComponent } from './components/news-streams/news-streams.component';
import { RatingStarComponent } from './components/rating-star/rating-star.component';
import { MapRatingComponent } from './components/map-rating/map-rating.component';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
  },
  {
    path: 'news/:id',
    component: SingleNewsPageComponent,
    pathMatch: 'full',
  },
  {
    path: 'news/theme/:theme',
    component: ThemeNewsPageComponent,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
  ],
  declarations: [
    MainPageComponent,
    NewsOnlineResultsComponent,
    NewsOnlineAnnounceComponent,
    NewsOfflineResultsComponent,
    NewsOfflineStartComponent,
    NewsSimpleComponent,
    NewsMulticupResultsComponent,
    HtmlNewsComponent,
    MulticupPhysicsTableComponent,
    NewsPhysicsTableComponent,
    NewsOnlineResultsTableComponent,
    NewsCommentsComponent,
    ValidationDialogComponent,
    PlayerDemosDialogComponent,
    SingleNewsPageComponent,
    InvalidDemosListComponent,
    NewsDfwcResultsComponent,
    ModeratorDeleteCommentDialogComponent,
    SmilesDropdownComponent,
    NewsSocialLinksComponent,
    NewsCommentTextComponent,
    OverbouncesWarningDialogComponent,
    SDCRulesDialogComponent,
    ThemeNewsPageComponent,
    NewsStreamersResultsComponent,
    NewsElementComponent,
    NewsStreamsComponent,
    RatingStarComponent,
    MapRatingComponent,
  ],
  providers: [NewsService],
})
export class MainPageModule {}
