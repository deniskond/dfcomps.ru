import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.less'],
})
export class RegisterDialogComponent {
  constructor(public dialogRef: MatDialogRef<RegisterDialogComponent>) {}

  public registerWithDiscord(): void {
    window.location.href =
      'https://discord.com/oauth2/authorize?response_type=token&client_id=1154028126783946772&scope=identify&state=register';
  }
}
