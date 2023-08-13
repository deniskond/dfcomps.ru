import { LanguageService } from '../../../../services/language/language.service';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, Observable, timer } from 'rxjs';
import { takeUntil, filter, map, switchMap, finalize } from 'rxjs/operators';
import { EMAIL_VALIDATION_REGEXP } from './configs/register-dialog.config';
import { UserService } from '../../../../services/user-service/user.service';
import { UserInterface } from '../../../../interfaces/user.interface';

const DEBOUNCE_TIME = 300;

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDialogComponent implements OnInit, OnDestroy {
  public needToDisplayErrors = false;
  public isLoading = false;
  public translations: Record<string, string>;

  public registerForm = new FormGroup(
    {
      login: new FormControl('', Validators.required, this.validateLogin$.bind(this)),
      email: new FormControl('', Validators.compose([Validators.required, this.validateEmail.bind(this)])),
      password: new FormControl('', Validators.required),
      validation: new FormControl('', Validators.required),
    },
    this.validateRepeatingPassword.bind(this),
  );

  private onDestroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<RegisterDialogComponent>,
    private userService: UserService,
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initDisplayErrorsSubscription();
    this.initTranslationsSubscription();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public get isLoginRequiredError(): boolean {
    return (
      this.needToDisplayErrors &&
      this.registerForm?.controls['login'].errors &&
      this.registerForm?.controls['login'].errors['required']
    );
  }

  public get loginInvalidError(): string {
    return (
      this.needToDisplayErrors &&
      this.registerForm?.controls['login'].errors &&
      this.registerForm?.controls['login'].errors['login']
    );
  }

  public get isEmailRequiredError(): boolean {
    return (
      this.needToDisplayErrors &&
      this.registerForm?.controls['email'].errors &&
      this.registerForm?.controls['email'].errors['required']
    );
  }

  public get emailInvalidError(): string {
    return (
      this.needToDisplayErrors &&
      this.registerForm?.controls['email'].errors &&
      this.registerForm?.controls['email'].errors['email']
    );
  }

  public get isPasswordRequiredError(): boolean {
    return (
      this.needToDisplayErrors &&
      this.registerForm?.controls['password'].errors &&
      this.registerForm?.controls['password'].errors['required']
    );
  }

  public get isPasswordValidationRequiredError(): boolean {
    return (
      this.needToDisplayErrors &&
      this.registerForm?.controls['validation'].errors &&
      this.registerForm?.controls['validation'].errors['required']
    );
  }

  public get passwordValidationError(): string {
    return this.needToDisplayErrors && this.registerForm?.errors && this.registerForm?.errors['validation'];
  }

  public onRegisterClick(): void {
    this.isLoading = true;

    this.userService
      .register$(
        this.registerForm.get('login')!.value!,
        this.registerForm.get('password')!.value!,
        this.registerForm.get('email')!.value!,
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((user: UserInterface) => {
        // TODO should be moved into userService
        this.userService.setCurrentUser(user);
        this.dialogRef.close();
      });
  }

  private initDisplayErrorsSubscription(): void {
    this.registerForm.valueChanges
      .pipe(
        filter(({ login, password, email, validation }) => !!login && !!password && !!email && !!validation),
        takeUntil(this.onDestroy$),
      )
      .subscribe(() => (this.needToDisplayErrors = true));
  }

  private validateRepeatingPassword(): Record<string, string> | null {
    return this.registerForm &&
      this.registerForm.controls['validation'].value === this.registerForm.controls['password'].value
      ? null
      : { validation: this.translations && this.translations['passwordsDoNotMatch'] };
  }

  private validateEmail({ value: email }: AbstractControl): Record<string, string> | null {
    return EMAIL_VALIDATION_REGEXP.test(String(email).toLowerCase())
      ? null
      : { email: this.translations && this.translations['wrongEmailFormat'] };
  }

  private validateLogin$({ value: login }: AbstractControl): Observable<Record<string, string> | null> {
    return timer(DEBOUNCE_TIME).pipe(
      switchMap(() => this.userService.checkLogin$(login)),
      map((loginAvailable: boolean) => (loginAvailable ? null : { login: this.translations['loginAlreadyTaken'] })),
    );
  }

  private initTranslationsSubscription(): void {
    this.languageService
      .getTranslations$()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((translations: Record<string, string>) => {
        this.translations = translations;
        this.changeDetectorRef.markForCheck();
      });
  }
}
