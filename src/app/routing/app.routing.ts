import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    { path: '', loadChildren: './pages/main/main.page.module#MainPageModule' },
    { path: 'rating', loadChildren: './pages/rating/rating.page.module#RatingPageModule' },
    { path: 'archive', loadChildren: './pages/archive/archive.page.module#ArchivePageModule' },
    { path: 'movies', loadChildren: './pages/movies/movies.page.module#MoviesPageModule' },
    { path: 'rules', loadChildren: './pages/rules/rules.page.module#RulesPageModule' },
    { path: 'teams', loadChildren: './pages/teams/teams.page.module#TeamsPageModule' },
];