import { CupTimerModule } from '../../modules/cup-timer/cup-timer.module';
import { TopTenTableModule } from '../../modules/top-ten-table/top-ten-table.module';
import { SiteHeaderModule } from '../../modules/site-header/site-header.module';
import { NgModule } from '@angular/core';
import { MainSiteComponent } from './main-site.component';
import { RouterModule } from '@angular/router';
import { mainSiteRoutes } from './main-site.routes';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [MainSiteComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(mainSiteRoutes),
        SiteHeaderModule,
        TopTenTableModule,
        CupTimerModule,
    ],
})
export class MainSiteModule {}
