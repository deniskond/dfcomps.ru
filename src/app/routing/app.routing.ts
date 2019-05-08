import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    { path: '', loadChildren: './upper-routing-modules/main-site/main-site.module.ts#MainSiteModule' },
];