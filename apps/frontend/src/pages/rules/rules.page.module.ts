import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RulesPageComponent } from './rules.page';
import { DSIComponent } from './dsi/dsi.component';

const routes: Routes = [
  {
    path: '',
    component: RulesPageComponent,
  },
  {
    path: 'speedrun-cup',
    component: DSIComponent,
  },
];

@NgModule({
  declarations: [RulesPageComponent, DSIComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class RulesPageModule {}
