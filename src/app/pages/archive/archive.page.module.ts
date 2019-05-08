import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ArchivePageComponent } from './archive.page';

const routes: Routes = [
    {
        path: '',
        component: ArchivePageComponent,
    },
];

@NgModule({
    declarations: [ArchivePageComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ArchivePageModule {}
