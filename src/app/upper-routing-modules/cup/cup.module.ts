import { NgModule } from '@angular/core';
import { CupComponent } from './cup.component';
import { RouterModule } from '@angular/router';
import { cupRoutes } from './cup.routes';

@NgModule({
    declarations: [CupComponent],
    imports: [RouterModule.forChild(cupRoutes)],
})
export class CupModule {}
