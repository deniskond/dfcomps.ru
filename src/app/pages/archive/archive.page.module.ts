import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ArchivePageComponent } from './archive.page';
import { MatProgressSpinnerModule, MatRippleModule } from '@angular/material';

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
