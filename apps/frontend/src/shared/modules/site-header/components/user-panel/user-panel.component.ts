import { API_URL } from '~shared/rest-api';
import { UserInterface } from '../../../../interfaces/user.interface';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { UserService } from '../../../../services/user-service/user.service';
import { filter, take } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isNonNull } from '../../../../../shared/helpers/is-non-null';

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPanelComponent implements OnInit, OnDestroy {
  public user$: Observable<UserInterface | null>;
  public apiUrl = API_URL;

  private onDestroy$ = new Subject<void>();

  constructor(private dialog: MatDialog, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.user$ = this.userService.getCurrentUser$();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public onLoginClick(): void {
    this.dialog.open(LoginDialogComponent, { data: { login: '', password: '' } });
  }

  public onRegisterClick(): void {
    this.dialog.open(RegisterDialogComponent);
  }

  public onLogoutClick(): void {
    this.userService.logout();
  }

  public onProfileClick(): void {
    this.user$.pipe(filter(isNonNull), take(1)).subscribe((user: UserInterface) => this.router.navigate([`/profile/${user.id}`]));
  }
}
