import { TopTenTableModule } from '../../modules/top-ten-table/top-ten-table.module';
import { CupTimerModule } from '../../modules/cup-timer/cup-timer.module';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { mainSiteRoutes } from './main-site.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatDividerModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatRippleModule,
} from '@angular/material';
import { NgModule } from '@angular/core';
import { MainSiteComponent } from './main-site.component';

@NgModule({
    declarations: [MainSiteComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(mainSiteRoutes),
        BrowserAnimationsModule,
        MatButtonModule,
        MatDividerModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatRippleModule,
        CupTimerModule,
        TopTenTableModule,
    ],
    bootstrap: [MainSiteComponent],
})
export class MainSiteModule {}
