import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ArchivePageComponent } from './archive.page';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
    {
        path: '',
        component: ArchivePageComponent,
    },
];

@NgModule({
    declarations: [ArchivePageComponent],
    imports: [CommonModule, RouterModule.forChild(routes), MatProgressSpinnerModule, MatRippleModule],
})
export class ArchivePageModule {}
