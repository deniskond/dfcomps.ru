import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Dfwc2019PageComponent } from './dfwc2019.page';
import { SharedModule } from '~shared/modules/shared.module';

const routes: Routes = [
  {
    path: '',
    component: Dfwc2019PageComponent,
  },
];

@NgModule({
  declarations: [Dfwc2019PageComponent],
  imports: [SharedModule, CommonModule, RouterModule.forChild(routes)],
})
export class Dfwc2019PageModule {}
