import { SharedModule } from '../../modules/shared.module';
import { CupComponent } from '../../pages/cup/cup.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { cupRoutes } from './cup.routes';

@NgModule({
    declarations: [CupComponent],
    imports: [RouterModule.forChild(cupRoutes), SharedModule],
})
export class CupModule {}
