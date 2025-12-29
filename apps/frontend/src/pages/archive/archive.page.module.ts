import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ArchivePageComponent } from './archive.page';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '~shared/modules/shared.module';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  {
    path: '',
    component: ArchivePageComponent,
  },
  {
    path: 'page/:pageNumber',
    component: ArchivePageComponent,
  },
  {
    path: 'filter/:filterType',
    component: ArchivePageComponent,
  },
  {
    path: 'filter/:filterType/page/:pageNumber',
    component: ArchivePageComponent,
  },
];

@NgModule({
  declarations: [ArchivePageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatRippleModule,
    SharedModule,
    MatButtonModule,
  ],
})
export class ArchivePageModule {}
