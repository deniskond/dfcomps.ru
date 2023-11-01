import { UserService } from '../../../../services/user-service/user.service';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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
  public isSelectingMethod = true;

  public loginForm = new FormGroup({
    login: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  public onLoginClick(): void {
    this.isLoading = true;

    this.userService
      .loginByPassword$(this.loginForm.controls['login'].value!, this.loginForm.controls['password'].value!)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => this.dialogRef.close(),
        error: () => {
          this.loginResult = false;
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  public proceedToLoginPassword(): void {
    this.isSelectingMethod = false;
  }

  public startDiscordOAuth(): void {
    window.location.href = 'https://discord.com/oauth2/authorize?response_type=token&client_id=1154028126783946772&scope=identify&state=login';
  }
}
