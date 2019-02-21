import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MoviesPageComponent } from './movies.page';

const routes: Routes = [
    {
        path: '',
        component: MoviesPageComponent
    }
];

@NgModule({
    declarations: [MoviesPageComponent],
    imports: [CommonModule, RouterModule.forChild(routes)]
})
export class MoviesPageModule {}
