import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../shared.module';
import { LastWrsComponent } from './last-wrs.component';

@NgModule({
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, SharedModule],
  declarations: [LastWrsComponent],
  exports: [LastWrsComponent],
})
export class LastWrsModule {}
