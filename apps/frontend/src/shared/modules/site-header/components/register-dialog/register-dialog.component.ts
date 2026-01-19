import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { getDiscordAuthURL } from '~shared/helpers/get-discord-auth-url';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.less'],
})
export class RegisterDialogComponent {
  constructor(public dialogRef: MatDialogRef<RegisterDialogComponent>) {}

  public registerWithDiscord(): void {
    window.location.href = getDiscordAuthURL('register');
  }
}
