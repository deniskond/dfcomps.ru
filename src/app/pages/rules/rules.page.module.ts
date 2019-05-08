import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RulesPageComponent } from './rules.page';

const routes: Routes = [
    {
        path: '',
        component: RulesPageComponent,
    },
];

@NgModule({
    declarations: [RulesPageComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class RulesPageModule {}
