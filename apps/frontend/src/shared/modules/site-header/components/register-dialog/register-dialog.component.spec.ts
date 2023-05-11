import { UserService } from '../../../../services/user-service/user.service';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegisterDialogComponent } from './register-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { mock, instance } from 'ts-mockito';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('RegisterDialogComponent', () => {
  let component: RegisterDialogComponent;
  let fixture: ComponentFixture<RegisterDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MatProgressSpinnerModule],
      declarations: [RegisterDialogComponent],
      providers: [
        { provide: MatDialogRef, useFactory: () => instance(mock(MatDialogRef)) },
        { provide: UserService, useFactory: () => instance(mock(UserService)) },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
