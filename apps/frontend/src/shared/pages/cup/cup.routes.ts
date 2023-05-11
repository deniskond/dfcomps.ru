import { Routes } from '@angular/router';
import { CupPageComponent } from './cup.page.component';

export const cupRoutes: Routes = [
  {
    path: ':type',
    component: CupPageComponent,
  },
];
