import { UserInterface } from '../../../../interfaces/user.interface';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

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
        const dialogRef = this.dialog.open(LoginDialogComponent);

        dialogRef.afterClosed().subscribe(() => {
            console.log('The dialog was closed');
        });
    }
}
