import { SharedModule } from '../../modules/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RatingPageComponent } from './rating.page';
import { RatingSystemComponent } from './rating-system/rating-system.component';

const routes: Routes = [
  {
    path: '',
    component: RatingPageComponent,
  },
  {
    path: 'system',
    component: RatingSystemComponent,
  },
];

@NgModule({
  declarations: [RatingPageComponent, RatingSystemComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), MatProgressSpinnerModule],
})
export class RatingPageModule {}
