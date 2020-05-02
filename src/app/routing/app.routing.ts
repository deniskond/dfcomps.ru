import { Routes } from '@angular/router';
import { ReflexComponent } from '../pages/reflex/reflex.component';

export const appRoutes: Routes = [
    { path: '', loadChildren: () => import('./../upper-routing-modules/main-site/main-site.module').then(m => m.MainSiteModule) },
    { path: 'cup', loadChildren: () => import('./../upper-routing-modules/cup/cup.module').then(m => m.CupModule) },
    { path: 'reflex', component: ReflexComponent },
];