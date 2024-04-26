import { SharedModule } from '~shared/modules/shared.module';
import { OnlineCupTimerComponent } from './online-cup-timer.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [OnlineCupTimerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: ':uuid',
        component: OnlineCupTimerComponent,
      },
    ]),
    SharedModule,
  ],
})
export class TimerPageModule {}
