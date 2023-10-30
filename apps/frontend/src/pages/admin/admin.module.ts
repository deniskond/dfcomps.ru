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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminValidateComponent } from './ui/admin-validate/admin-validate.component';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminSimpleNewsComponent } from './ui/admin-simple-news/admin-simple-news.component';
import { AdminMulticupRoundNewsComponent } from './ui/admin-multicup-round-news/admin-multicup-round-news.component';
import { QuillModule } from 'ngx-quill';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdminSeasonComponent } from './ui/admin-season/admin-season.component';
import { HasAdminRights } from './business/has-admin-rights.guard';
import { SharedModule } from '~shared/modules/shared.module';
import { HasAdminPanelAccess } from './business/has-admin-panel-access.guard';
import { AdminOfflineCupComponent } from './ui/admin-offline-cup/admin-offline-cup.component';

const adminRoutes: Routes = [
  {
    path: '',
    component: AdminPageComponent,
    canActivate: [HasAdminPanelAccess],
    children: [
      { path: '', component: AdminNewsComponent },
      {
        path: 'news',
        children: [
          {
            path: '',
            component: AdminNewsComponent,
          },
          {
            path: ':action',
            children: [
              {
                path: 'simple',
                children: [
                  {
                    path: '',
                    component: AdminSimpleNewsComponent,
                  },
                  {
                    path: ':id',
                    component: AdminSimpleNewsComponent,
                  },
                ],
              },
              {
                path: 'multicup-round-start',
                children: [
                  {
                    path: '',
                    component: AdminMulticupRoundNewsComponent,
                  },
                  {
                    path: ':id',
                    component: AdminMulticupRoundNewsComponent,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'cups',
        children: [
          { path: '', component: AdminCupsComponent },
          { path: 'add-offline-cup', component: AdminOfflineCupComponent, data: { multicup: false } },
          { path: 'add-multicup-round', component: AdminOfflineCupComponent, data: { multicup: true } },
          { path: 'edit/:id', component: AdminOfflineCupComponent },
        ],
      },
      {
        path: 'validate',
        children: [
          {
            path: ':id',
            component: AdminValidateComponent,
          },
        ],
      },
      {
        path: 'season',
        children: [{ path: '', component: AdminSeasonComponent }],
        canActivate: [HasAdminRights],
      },
    ],
  },
];

@NgModule({
  declarations: [
    AdminPageComponent,
    AdminMenuItemComponent,
    AdminNewsComponent,
    AdminCupsComponent,
    AdminValidateComponent,
    AdminSimpleNewsComponent,
    AdminMulticupRoundNewsComponent,
    AdminSeasonComponent,
    AdminOfflineCupComponent,
  ],
  imports: [
    RouterModule.forChild(adminRoutes),
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    SharedModule,
    CommonModule,
    MatSnackBarModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCheckboxModule,
    QuillModule.forRoot(),
  ],
  providers: [HasAdminPanelAccess, HasAdminRights],
})
export class AdminModule {}
