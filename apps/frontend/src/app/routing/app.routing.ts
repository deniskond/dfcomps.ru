import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('~shared/upper-routing-modules/main-site/main-site.module').then((m) => m.MainSiteModule),
  },
  { path: 'cup', loadChildren: () => import('~pages/cup/cup.page.module').then((m) => m.CupPageModule) },
  { path: 'admin', loadChildren: () => import('~pages/admin/admin.module').then((m) => m.AdminModule) },
  { path: 'timer', loadChildren: () => import('~pages/timer/timer.page.module').then((m) => m.TimerPageModule) },
  {
    path: 'oauth',
    children: [
      {
        path: 'discord',
        loadChildren: () => import('~features/discord-oauth/discord-oauth.module').then((m) => m.DiscordOauthModule),
      },
    ],
  },
];
