import { CupTimerModule } from '../../modules/cup-timer/cup-timer.module';
import { TopTenTableModule } from '../../modules/top-ten-table/top-ten-table.module';
import { SiteHeaderModule } from '../../modules/site-header/site-header.module';
import { NgModule } from '@angular/core';
import { MainSiteComponent } from './main-site.component';
import { RouterModule } from '@angular/router';
import { mainSiteRoutes } from './main-site.routes';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../modules/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { OneVOneWidgetComponent } from '../../components/one-v-one-widget/one-v-one-widget.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    declarations: [MainSiteComponent, OneVOneWidgetComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(mainSiteRoutes),
        SiteHeaderModule,
        TopTenTableModule,
        CupTimerModule,
        SharedModule,
        MatTabsModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
    ],
})
export class MainSiteModule {}
