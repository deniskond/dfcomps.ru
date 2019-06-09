import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, Observable, timer } from 'rxjs';
import { takeUntil, filter, map, debounceTime, switchMap } from 'rxjs/operators';
import { RegisterDialogDataInterface } from '../../interfaces/register-dialog-data.interface';
import { EMAIL_VALIDATION_REGEXP } from './configs/register-dialog.config';
import { UserService } from '../../../../services/user-service/user.service';

const DEBOUNCE_TIME = 300;

@Component({
    selector: 'app-register-dialog',
    templateUrl: './register-dialog.component.html',
    styleUrls: ['./register-dialog.component.less'],
})
export class RegisterDialogComponent implements OnInit, OnDestroy {
    public needToDisplayErrors = false;

    public loginForm = new FormGroup(
        {
            login: new FormControl('', Validators.required, this.validateLogin$.bind(this)),
            email: new FormControl('', Validators.compose([Validators.required, this.validateEmail])),
            password: new FormControl('', Validators.required),
            validation: new FormControl('', Validators.compose([Validators.required])),
        },
        this.validateRepeatingPassword.bind(this),
    );

    private onDestroy$ = new Subject<void>();

    constructor(public dialogRef: MatDialogRef<RegisterDialogComponent>, private userService: UserService) {}

    ngOnInit(): void {
        this.setDisplayErrorsSubscription();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    public onRegisterClick(): void {
        // TODO [DFRU-12]
    }

    private setDisplayErrorsSubscription(): void {
        this.loginForm.valueChanges
            .pipe(
                filter(
                    ({ login, password, email, validation }: RegisterDialogDataInterface) =>
                        !!login && !!password && !!email && !!validation,
                ),
                takeUntil(this.onDestroy$),
            )
            .subscribe(() => (this.needToDisplayErrors = true));
    }

    private validateRepeatingPassword(): Record<string, string> | null {
        return this.loginForm && this.loginForm.controls.validation.value === this.loginForm.controls.password.value
            ? null
            : { validation: 'Пароли не совпадают' };
    }

    private validateEmail({ value: email }: AbstractControl): Record<string, string> | null {
        return EMAIL_VALIDATION_REGEXP.test(String(email).toLowerCase()) ? null : { email: 'Неверный формат e-mail' };
    }

    private validateLogin$({ value: login }: AbstractControl): Observable<Record<string, string> | null> {
        return timer(DEBOUNCE_TIME).pipe(
            switchMap(() => this.userService.checkLogin$(login)),
            map((loginAvailable: boolean) => (loginAvailable ? null : { login: 'Логин уже занят' })),
        );
    }
}
