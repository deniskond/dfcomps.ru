import { MatProgressSpinnerModule, MatRippleModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopTenTableComponent } from './top-ten-table.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';

@NgModule({
    imports: [
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
