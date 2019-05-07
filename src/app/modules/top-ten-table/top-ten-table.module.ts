import { FlagComponent } from '../../components/flag/flag.component';
import { MatTableModule, MatProgressSpinnerModule } from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopTenTableComponent } from './top-ten-table.component';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [MatTableModule, CdkTableModule, CommonModule, MatProgressSpinnerModule, BrowserAnimationsModule],
    declarations: [TopTenTableComponent, FlagComponent],
    exports: [TopTenTableComponent],
})
export class TopTenTableModule {}
