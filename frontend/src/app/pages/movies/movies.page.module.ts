import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MoviesPageComponent } from './movies.page';
import { MoviesService } from './services/movies.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../../modules/shared.module';

const routes: Routes = [
    {
        path: '',
        component: MoviesPageComponent,
    },
];

@NgModule({
    declarations: [MoviesPageComponent],
    imports: [CommonModule, RouterModule.forChild(routes), MatProgressSpinnerModule, SharedModule],
    providers: [MoviesService],
})
export class MoviesPageModule {}
