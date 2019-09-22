import { CupRoundComponent } from '../../pages/cup/cup-round/cup-round.component';
import { SharedModule } from '../../modules/shared.module';
import { CupComponent } from '../../pages/cup/cup.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { cupRoutes } from './cup.routes';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [CupComponent, CupRoundComponent],
    imports: [CommonModule, RouterModule.forChild(cupRoutes), SharedModule],
})
export class CupModule {}
