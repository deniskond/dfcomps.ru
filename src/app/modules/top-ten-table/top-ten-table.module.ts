import { MatProgressSpinnerModule, MatRippleModule } from '@angular/material';
import { TopTenTableComponent } from './top-ten-table.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        SharedModule,
    ],
    declarations: [TopTenTableComponent],
    exports: [TopTenTableComponent],
})
export class TopTenTableModule {}
