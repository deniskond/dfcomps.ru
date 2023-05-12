import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-delete-comment-dialog',
  templateUrl: './admin-delete-comment-dialog.component.html',
  styleUrls: ['./admin-delete-comment-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDeleteCommentDialogComponent {
  public reasonForm = new FormGroup({
    reason: new FormControl('', Validators.required),
  });

  constructor(
    public dialogRef: MatDialogRef<AdminDeleteCommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reason: string },
  ) {}

  public onSaveClick(): void {
    this.dialogRef.close(this.reasonForm.get('reason')!.value);
  }
}
