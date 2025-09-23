import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePageComponent } from './profile.page';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProfileCupsTableComponent } from './components/profile-cups-table/profile-cups-table.component';
import { ProfileCupStatsComponent } from './components/profile-cup-stats/profile-cup-stats.component';
import { ProfileRewardsComponent } from './components/profile-rewards/profile-rewards.component';
import { ProfileRatingChartComponent } from './components/profile-rating-chart/profile-rating-chart.component';
import { ProfileService } from './services/profile.service';
import { ProfileLastDemosComponent } from './components/profile-last-demos/profile-last-demos.component';
import { CdkTableModule } from '@angular/cdk/table';
import { NgChartsModule } from 'ng2-charts';
import { EditProfileDialogComponent } from './components/edit-profile-dialog/edit-profile-dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '~shared/modules/shared.module';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: '',
    component: ProfilePageComponent,
  },
];

@NgModule({
  declarations: [
    ProfilePageComponent,
    ProfileCupsTableComponent,
    ProfileCupStatsComponent,
    ProfileRewardsComponent,
    ProfileRatingChartComponent,
    ProfileLastDemosComponent,
    EditProfileDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    SharedModule,
    MatButtonModule,
    MatTooltipModule,
    MatTableModule,
    CdkTableModule,
    NgChartsModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  providers: [ProfileService],
})
export class ProfilePageModule {}
