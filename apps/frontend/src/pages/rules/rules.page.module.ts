import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RulesPageComponent } from './rules.page';
import { DSIComponent } from './dsi/dsi.component';
import { EESystemComponent } from './ee-system/ee-system.component';

const routes: Routes = [
  {
    path: '',
    component: RulesPageComponent,
  },
  {
    path: 'speedrun-cup',
    component: DSIComponent,
  },
  {
    path: 'ee-system',
    component: EESystemComponent,
  },
];

@NgModule({
  declarations: [RulesPageComponent, DSIComponent, EESystemComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class RulesPageModule {}
