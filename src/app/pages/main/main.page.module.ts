import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './main.page';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule, MatButtonToggleModule } from '@angular/material';

const routes: Routes = [
    {
        path: '',
        component: MainPageComponent,
    },
];

@NgModule({
    declarations: [MainPageComponent],
    imports: [CommonModule, RouterModule.forChild(routes), MatButtonModule, MatButtonToggleModule],
})
export class MainPageModule {}
