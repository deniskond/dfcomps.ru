import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dfcomps-new-discord-account',
  templateUrl: './new-discord-account.component.html',
  styleUrls: ['./new-discord-account.component.less'],
})
export class NewDiscordAccountComponent {
  public isFirstStep: boolean;

  constructor(
    public dialogRef: MatDialogRef<NewDiscordAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isFirstStep: boolean; discordAccessToken: string },
  ) {}

  ngOnInit(): void {
    this.isFirstStep = this.data.isFirstStep;
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  nextStep(): void {
    this.isFirstStep = false;
  }
}
