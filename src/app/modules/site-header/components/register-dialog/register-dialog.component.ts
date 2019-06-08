import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-register-dialog',
    templateUrl: './register-dialog.component.html',
    styleUrls: ['./register-dialog.component.less'],
})
export class RegisterDialogComponent {
    constructor(public dialogRef: MatDialogRef<RegisterDialogComponent>) {}

    onRegisterClick(): void {
        this.dialogRef.close();
    }
}
