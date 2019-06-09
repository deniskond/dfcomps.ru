import { UserInterface } from '../../../../interfaces/user.interface';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { UserService } from '../../../../services/user-service/user.service';
import { switchMap } from 'rxjs/operators';
import { LoginDialogDataInterface } from '../../interfaces/login-dialog-data.interface';

@Component({
    selector: 'app-user-panel',
    templateUrl: './user-panel.component.html',
    styleUrls: ['./user-panel.component.less'],
})
export class UserPanelComponent {
    @Input()
    isLogged: boolean;
    @Input()
    userInfo: UserInterface;

    @Output()
    openProfile = new EventEmitter<void>();

    constructor(private dialog: MatDialog, private userService: UserService) {}

    public onLoginClick(): void {
        this.dialog
            .open(LoginDialogComponent, { data: { login: '', password: '' } })
            .afterClosed()
            .pipe(switchMap(({ login, password }: LoginDialogDataInterface) => this.userService.login(login, password)))
            .subscribe(val => {
                console.log(val);
            });
    }

    public onRegisterClick(): void {
        this.dialog
            .open(RegisterDialogComponent)
            .afterClosed()
            .subscribe(() => {
                console.log('The dialog was closed');
            });
    }
}
