import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './ui/admin-page/admin-page.component';
import { AdminMenuItemComponent } from './ui/admin-menu-item/admin-menu-item.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

const adminRoutes: Routes = [
  {
    path: '',
    component: AdminPageComponent,
  },
];

@NgModule({
  declarations: [AdminPageComponent, AdminMenuItemComponent],
  imports: [RouterModule.forChild(adminRoutes), MatButtonModule, MatIconModule, CommonModule],
})
export class AdminModule {}
