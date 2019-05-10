import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePageComponent } from './profile.page';
import { MatProgressSpinnerModule, MatButtonModule } from '@angular/material';
import { SharedModule } from '../../modules/shared.module';
import { ProfileCupsTableComponent } from './components/profile-cups-table/profile-cups-table.component';
import { ProfileRewardsComponent } from './components/profile-rewards/profile-rewards.component';
import { ProfileRatingChartComponent } from './components/profile-rating-chart/profile-rating-chart.component';
import { ProfileService } from './services/profile.service';

const routes: Routes = [
    {
        path: '',
        component: ProfilePageComponent,
    },
];

@NgModule({
    declarations: [ProfilePageComponent, ProfileCupsTableComponent, ProfileRewardsComponent, ProfileRatingChartComponent],
    imports: [CommonModule, RouterModule.forChild(routes), MatProgressSpinnerModule, SharedModule, MatButtonModule],
    providers: [ProfileService],
})
export class ProfilePageModule {}
