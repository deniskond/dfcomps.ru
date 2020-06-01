import { Routes } from '@angular/router';
import { MainSiteComponent } from './main-site.component';

export const mainSiteRoutes: Routes = [
    {
        path: '',
        component: MainSiteComponent,
        children: [
            { path: '', loadChildren: () => import('./../../pages/main/main.page.module').then(m => m.MainPageModule) },
            { path: 'news', loadChildren: () => import('./../../pages/main/main.page.module').then(m => m.MainPageModule) },
            { path: 'rating', loadChildren: () => import('./../../pages/rating/rating.page.module').then(m => m.RatingPageModule) },
            { path: 'archive', loadChildren: () => import('./../../pages/archive/archive.page.module').then(m => m.ArchivePageModule) },
            { path: 'movies', loadChildren: () => import('./../../pages/movies/movies.page.module').then(m => m.MoviesPageModule) },
            { path: 'rules', loadChildren: () => import('./../../pages/rules/rules.page.module').then(m => m.RulesPageModule) },
            { path: 'teams', loadChildren: () => import('./../../pages/teams/teams.page.module').then(m => m.TeamsPageModule) },
            { path: 'profile/:id', loadChildren: () => import('./../../pages/profile/profile.page.module').then(m => m.ProfilePageModule) },
            { path: 'dfwc2019', loadChildren: () => import('./../../pages/dfwc2019/dfwc2019.page.module').then(m => m.Dfwc2019PageModule) },
            { path: '1v1', loadChildren: () => import('./../../pages/1v1/1v1.page.module').then(m => m.OneVOnePageModule) },
        ],
    },
];
