import { SiteHeaderComponent } from './site-header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { UserPanelComponent } from './components/user-panel/user-panel.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { RegisterDialogComponent } from './components/register-dialog/register-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared.module';
import { DownloadDfDialogComponent } from './components/download-df-dialog/download-df-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    MatDividerModule,
    MatTabsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatRippleModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  declarations: [
    SiteHeaderComponent,
    UserPanelComponent,
    LoginDialogComponent,
    RegisterDialogComponent,
    DownloadDfDialogComponent,
  ],
  exports: [SiteHeaderComponent],
})
export class SiteHeaderModule {}
