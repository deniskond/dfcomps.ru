import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePageComponent } from './profile.page';

const routes: Routes = [
    {
        path: '',
        component: ProfilePageComponent,
    },
];

@NgModule({
    declarations: [ProfilePageComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ProfilePageModule {}
