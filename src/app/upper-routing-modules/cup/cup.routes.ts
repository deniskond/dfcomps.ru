import { CupRoundComponent } from '../../pages/cup/cup-round/cup-round.component';
import { CupComponent } from '../../pages/cup/cup.component';
import { Routes } from '@angular/router';

export const cupRoutes: Routes = [
    {
        path: '',
        component: CupComponent,
    },
    {
        path: 'round',
        component: CupRoundComponent,
    },
];
