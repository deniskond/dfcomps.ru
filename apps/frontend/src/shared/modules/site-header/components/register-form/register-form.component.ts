import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, filter, finalize, map, switchMap, takeUntil, timer } from 'rxjs';
import { LanguageService } from '~shared/services/language/language.service';
import { UserService } from '~shared/services/user-service/user.service';

const DEBOUNCE_TIME = 300;

@Component({
  selector: 'dfcomps-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.less'],
})
export class RegisterFormComponent {
  @Output() closeDialog = new EventEmitter<void>();

  public needToDisplayErrors = false;
  public isLoading = false;
  public translations: Record<string, string>;
  public registerForm = new FormGroup({
    login: new FormControl('', Validators.required, this.validateLogin$.bind(this)),
  });

  private onDestroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private languageService: LanguageService,
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

  public onRegisterClick(): void {
    this.isLoading = true;

    this.userService
      .register$(this.registerForm.get('login')!.value!)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(() => this.closeDialog.emit());
  }

  private initDisplayErrorsSubscription(): void {
    this.registerForm.valueChanges
      .pipe(
        filter(({ login }) => !!login),
        takeUntil(this.onDestroy$),
      )
      .subscribe(() => (this.needToDisplayErrors = true));
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
      .subscribe((translations: Record<string, string>) => (this.translations = translations));
  }
}
