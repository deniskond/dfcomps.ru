import { NgModule } from '@angular/core';
import { CupTimerModule } from './cup-timer/cup-timer.module';
import { MatTableModule, MatProgressSpinnerModule } from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';
import { TopTenTableComponent } from '../components/top-ten-table/top-ten-table.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CupTimerModule, MatTableModule, CdkTableModule, CommonModule, MatProgressSpinnerModule],
    declarations: [TopTenTableComponent],
    exports: [TopTenTableComponent],
})
export class SharedModule {}
