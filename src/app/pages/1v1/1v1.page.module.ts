import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../modules/shared.module';
import { OneVOnePageComponent } from './1v1.page';
import { MatButtonModule } from '@angular/material/button';
import { QueueTimerComponent } from './components/queue-timer/queue-timer.component';
import { MatchProgressComponent } from './components/match-progress/match-progress.component';

const routes: Routes = [
    {
        path: '',
        component: OneVOnePageComponent,
    },
];

@NgModule({
    declarations: [OneVOnePageComponent, QueueTimerComponent, MatchProgressComponent],
    imports: [CommonModule, RouterModule.forChild(routes), MatProgressSpinnerModule, SharedModule, MatButtonModule],
})
export class OneVOnePageModule {}
