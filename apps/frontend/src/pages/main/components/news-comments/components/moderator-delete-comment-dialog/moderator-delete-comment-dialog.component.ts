import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-moderator-delete-comment-dialog',
  templateUrl: './moderator-delete-comment-dialog.component.html',
  styleUrls: ['./moderator-delete-comment-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeratorDeleteCommentDialogComponent {
  public reasonForm = new FormGroup({
    reason: new FormControl('', Validators.required),
  });

  constructor(
    public dialogRef: MatDialogRef<ModeratorDeleteCommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reason: string },
  ) {}

  public onSaveClick(): void {
    this.dialogRef.close(this.reasonForm.get('reason')!.value);
  }
}
