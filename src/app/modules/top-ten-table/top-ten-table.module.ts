import { MatTableModule, MatProgressSpinnerModule, MatRippleModule } from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopTenTableComponent } from './top-ten-table.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';

@NgModule({
    imports: [
        MatTableModule,
        CdkTableModule,
        CommonModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
        MatRippleModule,
        SharedModule,
    ],
    declarations: [TopTenTableComponent],
    exports: [TopTenTableComponent],
})
export class TopTenTableModule {}
