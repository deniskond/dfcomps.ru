import { UserInterface } from '../../../../interfaces/user.interface';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';

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

    constructor(public dialog: MatDialog) {}

    public onLoginClick(): void {
        this.dialog.open(LoginDialogComponent).afterClosed().subscribe(() => {
            console.log('The dialog was closed');
        });
    }

    public onRegisterClick(): void {
        this.dialog.open(RegisterDialogComponent).afterClosed().subscribe(() => {
            console.log('The dialog was closed');
        });
    }
}
