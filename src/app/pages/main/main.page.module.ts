import { NewsReflexOfflineResultsComponent } from './components/news-reflex-offline-results/news-reflex-offline-results.component';
import { NewsReflexOfflineStartComponent } from './components/news-reflex-offline-start/news-reflex-offline-start.component';
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
import { NewsDfwcResultsComponent } from './components/news-dfwc-results/news-dfwc-results.component';
import { ReflexPlayerDemosDialogComponent } from './components/news-reflex-offline-start/reflex-player-demos-dialog/reflex-player-demos-dialog.component';
import { NewsReflexPhysicsTableComponent } from './components/news-reflex-offline-results/news-reflex-physics-table/news-reflex-physics-table.component';
import { ReflexInvalidDemosListComponent } from './components/news-reflex-offline-results/reflex-invalid-demos-list/reflex-invalid-demos-list.component';
import { AdminDeleteCommentDialogComponent } from './components/news-comments/components/admin-delete-comment-dialog/admin-delete-comment-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewsSocialLinksComponent } from './components/news-social-links/news-social-links.component';

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
        FormsModule,
        ReactiveFormsModule,
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
        ReflexPlayerDemosDialogComponent,
        SingleNewsPageComponent,
        InvalidDemosListComponent,
        NewsDfwcResultsComponent,
        NewsReflexOfflineStartComponent,
        NewsReflexOfflineResultsComponent,
        NewsReflexPhysicsTableComponent,
        ReflexInvalidDemosListComponent,
        AdminDeleteCommentDialogComponent,
        NewsSocialLinksComponent,
    ],
    providers: [NewsService],
    entryComponents: [
        ValidationDialogComponent,
        PlayerDemosDialogComponent,
        ReflexPlayerDemosDialogComponent,
        AdminDeleteCommentDialogComponent,
    ],
})
export class MainPageModule {}
