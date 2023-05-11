import { Routes } from '@angular/router';
import { OnlineCupTimerComponent } from '../components/online-cup-timer/online-cup-timer.component';
import { ReflexComponent } from '../pages/reflex/reflex.component';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./../upper-routing-modules/main-site/main-site.module').then((m) => m.MainSiteModule),
  },
  { path: 'cup', loadChildren: () => import('./../upper-routing-modules/cup/cup.module').then((m) => m.CupModule) },
  { path: 'reflex', component: ReflexComponent },
  { path: 'admin', loadChildren: () => import('./../../pages/admin/admin.module').then((m) => m.AdminModule) },
  { path: 'timer', component: OnlineCupTimerComponent },
];
