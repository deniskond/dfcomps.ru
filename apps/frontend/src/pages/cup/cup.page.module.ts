import { CupPageComponent } from './cup.page.component';
import { NgModule } from '@angular/core';
import { CupFullTableComponent } from './components/cup-full-table/cup-full-table.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { cupRoutes } from './cup.routes';
import { CupRoundComponent } from './components/cup-round/cup-round.component';
import { SharedModule } from '~shared/modules/shared.module';

@NgModule({
  declarations: [CupPageComponent, CupFullTableComponent, CupRoundComponent],
  imports: [CommonModule, RouterModule.forChild(cupRoutes), SharedModule],
})
export class CupPageModule {}
