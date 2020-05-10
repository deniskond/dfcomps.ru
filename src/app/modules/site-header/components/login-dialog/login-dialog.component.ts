import { LoginResultDtoInterface } from '../../../../services/user-service/dto/login-result.dto';
import { UserService } from '../../../../services/user-service/user.service';
import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoginDialogDataInterface } from '../../interfaces/login-dialog-data.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-login-dialog',
    templateUrl: './login-dialog.component.html',
    styleUrls: ['./login-dialog.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {
    public loginResult: boolean;
    public isLoading = false;

    public loginForm = new FormGroup({
        login: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
    });

    constructor(
        public dialogRef: MatDialogRef<LoginDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: LoginDialogDataInterface,
        private userService: UserService,
    ) {
    }

    public onLoginClick(): void {
        this.isLoading = true;

        this.userService
            .login$(this.loginForm.controls.login.value, this.loginForm.controls.password.value)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe((({ logged, user }: LoginResultDtoInterface) => {
                this.loginResult = logged;

                if (logged) {
                    this.userService.setCurrentUser(user);
                    this.dialogRef.close();
                }
            }));
    }
}
