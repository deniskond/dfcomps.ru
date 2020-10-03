import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TeamsPageComponent } from './teams.page';

const routes: Routes = [
    {
        path: '',
        component: TeamsPageComponent,
    },
];

@NgModule({
    declarations: [TeamsPageComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TeamsPageModule {}
