import { NgModule } from '@angular/core';
import { CupTimerComponent } from './cup-timer.component';
import { CupTimerOnlineComponent } from './components/cup-timer-online/cup-timer-online.component';
import { CupTimerOnlineAwaitingComponent } from './components/cup-timer-online-awaiting/cup-timer-online-awaiting.component';
import { CupTimerOnlineProgressComponent } from './components/cup-timer-online-progress/cup-timer-online-progress.component';
import { CupTimerOnlineFinishedComponent } from './components/cup-timer-online-finished/cup-timer-online-finished.component';
import { CupTimerOfflineComponent } from './components/cup-timer-offline/cup-timer-offline.component';
import { CupTimerOfflineAwaitingComponent } from './components/cup-timer-offline-awaiting/cup-timer-offline-awaiting.component';
import { CupTimerOfflineProgressComponent } from './components/cup-timer-offline-progress/cup-timer-offline-progress.component';
import { CupTimerOfflineFinishedComponent } from './components/cup-timer-offline-finished/cup-timer-offline-finished.component';
import { CountdownTimerComponent } from './components/countdown-timer/countdown-timer.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    CupTimerComponent,
    CupTimerOnlineComponent,
    CupTimerOnlineAwaitingComponent,
    CupTimerOnlineProgressComponent,
    CupTimerOnlineFinishedComponent,
    CupTimerOfflineComponent,
    CupTimerOfflineAwaitingComponent,
    CupTimerOfflineProgressComponent,
    CupTimerOfflineFinishedComponent,
    CountdownTimerComponent,
  ],
  exports: [CupTimerComponent, CountdownTimerComponent],
})
export class CupTimerModule {}
