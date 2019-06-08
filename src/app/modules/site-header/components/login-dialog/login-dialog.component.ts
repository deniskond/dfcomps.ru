import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-login-dialog',
    templateUrl: './login-dialog.component.html',
    styleUrls: ['./login-dialog.component.less'],
})
export class LoginDialogComponent {
    constructor(public dialogRef: MatDialogRef<LoginDialogComponent>) {}

    onLoginClick(): void {
        this.dialogRef.close();
    }
}
