import { API_URL } from '../../../../configs/url-params.config';
import { UserInterface } from '../../../../interfaces/user.interface';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { UserService } from '../../../../services/user-service/user.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-user-panel',
    templateUrl: './user-panel.component.html',
    styleUrls: ['./user-panel.component.less'],
})
export class UserPanelComponent implements OnInit, OnDestroy {
    public user: UserInterface;
    public apiUrl = API_URL;

    private onDestroy$ = new Subject<void>();

    constructor(private dialog: MatDialog, private userService: UserService, private router: Router) {}

    ngOnInit(): void {
        this.userService
            .getCurrentUser$()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((user: UserInterface) => (this.user = user));
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    public onLoginClick(): void {
        this.dialog.open(LoginDialogComponent, { data: { login: '', password: '' } })
    }

    public onRegisterClick(): void {
        this.dialog.open(RegisterDialogComponent);
    }

    public onLogoutClick(): void {
        this.userService.logout();
    }

    public onProfileClick(): void {
        this.router.navigate([`/profile/${this.user.id}`]);
    }
}
