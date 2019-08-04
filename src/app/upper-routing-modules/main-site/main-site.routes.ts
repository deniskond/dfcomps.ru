import { Routes } from '@angular/router';
import { MainSiteComponent } from './main-site.component';

export const mainSiteRoutes: Routes = [
    {
        path: '',
        component: MainSiteComponent,
        children: [
            { path: '', loadChildren: './../../pages/main/main.page.module#MainPageModule' },
            { path: 'rating', loadChildren: './../../pages/rating/rating.page.module#RatingPageModule' },
            { path: 'archive', loadChildren: './../../pages/archive/archive.page.module#ArchivePageModule' },
            { path: 'movies', loadChildren: './../../pages/movies/movies.page.module#MoviesPageModule' },
            { path: 'rules', loadChildren: './../../pages/rules/rules.page.module#RulesPageModule' },
            { path: 'teams', loadChildren: './../../pages/teams/teams.page.module#TeamsPageModule' },
            { path: 'profile/:id', loadChildren: './../../pages/profile/profile.page.module#ProfilePageModule' },
            { path: 'news', loadChildren: './../../pages/main/main.page.module#MainPageModule' },
        ],
    },
];
