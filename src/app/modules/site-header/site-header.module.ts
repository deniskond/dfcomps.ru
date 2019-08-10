import { HttpClientModule } from '@angular/common/http';
import { SiteHeaderComponent } from './site-header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatDividerModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatRippleModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
} from '@angular/material';
import { UserPanelComponent } from './components/user-panel/user-panel.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { RegisterDialogComponent } from './components/register-dialog/register-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared.module';
import { DownloadDfDialogComponent } from './components/download-df-dialog/download-df-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatDividerModule,
        MatTabsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatRippleModule,
        HttpClientModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
    ],
    declarations: [SiteHeaderComponent, UserPanelComponent, LoginDialogComponent, RegisterDialogComponent, DownloadDfDialogComponent],
    exports: [SiteHeaderComponent],
    entryComponents: [LoginDialogComponent, RegisterDialogComponent, DownloadDfDialogComponent],
})
export class SiteHeaderModule {}
