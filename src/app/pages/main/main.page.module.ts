import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main.page';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressSpinnerModule, MatButtonModule, MatSnackBarModule, MatDialogModule } from '@angular/material';
import { NewsOnlineResultsComponent } from './components/news-online-results/news-online-results.component';
import { NewsOnlineAnnounceComponent } from './components/news-online-announce/news-online-announce.component';
import { NewsOfflineResultsComponent } from './components/news-offline-results/news-offline-results.component';
import { NewsOfflineStartComponent } from './components/news-offline-start/news-offline-start.component';
import { NewsSimpleComponent } from './components/news-simple/news-simple.component';
import { NewsMulticupResultsComponent } from './components/news-multicup-results/news-multicup-results.component';
import { NewsService } from '../../services/news-service/news.service';
import { HtmlNewsComponent } from './components/html-news/html-news.component';
import { SharedModule } from '../../modules/shared.module';
import { MulticupPhysicsTableComponent } from './components/news-multicup-results/multicup-physics-table/multicup-physics-table.component';
import { NewsPhysicsTableComponent } from './components/news-offline-results/news-physics-table/news-physics-table.component';
import { NewsOnlineResultsTableComponent } from './components/news-online-results/online-results-table/online-results-table.component';
import { NewsCommentsComponent } from './components/news-comments/news-comments.component';
import { ValidationDialogComponent } from './components/news-offline-start/validation-dialog/validation-dialog.component';
import { PlayerDemosDialogComponent } from './components/news-offline-start/player-demos-dialog/player-demos-dialog.component';
import { SingleNewsPageComponent } from './components/single-news-page/single-news-page.component';
import { InvalidDemosListComponent } from './components/news-offline-results/invalid-demos-list/invalid-demos-list.component';

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
    ],
    providers: [NewsService],
    entryComponents: [ValidationDialogComponent, PlayerDemosDialogComponent],
})
export class MainPageModule {}
