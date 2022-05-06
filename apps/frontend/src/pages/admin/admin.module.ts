import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './ui/admin-page/admin-page.component';
import { AdminMenuItemComponent } from './ui/admin-menu-item/admin-menu-item.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AdminNewsComponent } from './ui/admin-news/admin-news.component';
import { AdminCupsComponent } from './ui/admin-cups/admin-cups.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../app/modules/shared.module';
import { HasAdminPanelAccess } from './has-admin-panel-access.guard';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const adminRoutes: Routes = [
  {
    path: '',
    component: AdminPageComponent,
    canActivate: [HasAdminPanelAccess],
    children: [
      { path: '', component: AdminNewsComponent },
      { path: 'news', component: AdminNewsComponent },
      { path: 'cups', component: AdminCupsComponent },
    ],
  },
];

@NgModule({
  declarations: [AdminPageComponent, AdminMenuItemComponent, AdminNewsComponent, AdminCupsComponent],
  imports: [
    RouterModule.forChild(adminRoutes),
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    SharedModule,
    CommonModule,
    MatSnackBarModule,
  ],
  providers: [HasAdminPanelAccess],
})
export class AdminModule {}
