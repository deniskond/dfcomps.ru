import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '~shared/modules/shared.module';
import { WrDatabasePageComponent } from './wr-database.page';
import { WrUploadBlockComponent } from './components/wr-upload-block/wr-upload-block.component';
import { WrListComponent } from './components/wr-list/wr-list.component';
import { WrDatabaseService } from './services/wr-database.service';
import { UserService } from '~shared/services/user-service/user.service';

const routes: Routes = [
  {
    path: '',
    component: WrDatabasePageComponent,
  },
];

@NgModule({
  declarations: [WrDatabasePageComponent, WrUploadBlockComponent, WrListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    SharedModule,
  ],
  providers: [WrDatabaseService, UserService],
})
export class WrDatabasePageModule {}
