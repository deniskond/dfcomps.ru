import { HttpClientModule } from '@angular/common/http';
import { SiteHeaderComponent } from './site-header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule, MatTabsModule, MatButtonToggleModule, MatRippleModule, MatButtonModule } from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        MatDividerModule,
        MatTabsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatRippleModule,
        HttpClientModule,
    ],
    declarations: [SiteHeaderComponent],
    exports: [SiteHeaderComponent],
})
export class SiteHeaderModule {}
