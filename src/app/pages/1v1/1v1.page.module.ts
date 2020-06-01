import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../modules/shared.module';
import { OneVOnePageComponent } from './1v1.page';

const routes: Routes = [
    {
        path: '',
        component: OneVOnePageComponent,
    },
];

@NgModule({
    declarations: [OneVOnePageComponent],
    imports: [CommonModule, RouterModule.forChild(routes), MatProgressSpinnerModule, SharedModule],
})
export class OneVOnePageModule {}
