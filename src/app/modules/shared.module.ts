import { NgModule } from '@angular/core';
import { CupTimerModule } from './cup-timer/cup-timer.module';
import { TopTenTableComponent } from '../components/top-ten-table/top-ten-table/top-ten-table.component';
import { MatTableModule } from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
    imports: [CupTimerModule, MatTableModule, CdkTableModule],
    declarations: [TopTenTableComponent],
    exports: [TopTenTableComponent],
})
export class SharedModule {}
