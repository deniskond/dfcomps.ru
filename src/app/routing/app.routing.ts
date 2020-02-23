import { Routes } from '@angular/router';
import { ReflexComponent } from '../pages/reflex/reflex.component';

export const appRoutes: Routes = [
    { path: '', loadChildren: './upper-routing-modules/main-site/main-site.module#MainSiteModule' },
    { path: 'cup', loadChildren: './upper-routing-modules/cup/cup.module#CupModule' },
    { path: 'reflex', component: ReflexComponent },
];