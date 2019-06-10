import { UserService } from '../../../../services/user-service/user.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginDialogComponent } from './login-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { mock, instance } from 'ts-mockito';

describe('LoginDialogComponent', () => {
    let component: LoginDialogComponent;
    let fixture: ComponentFixture<LoginDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, MatProgressSpinnerModule, MatDialogModule],
            declarations: [LoginDialogComponent],
            providers: [
                { provide: MatDialogRef, useFactory: () => instance(mock(MatDialogRef)) },
                { provide: UserService, useFactory: () => instance(mock(UserService)) },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
