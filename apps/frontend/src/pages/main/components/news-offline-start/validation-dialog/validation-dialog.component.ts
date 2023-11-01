import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidationErrorInterface } from '@dfcomps/contracts';

@Component({
  selector: 'app-validation-dialog',
  templateUrl: './validation-dialog.component.html',
  styleUrls: ['./validation-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationDialogComponent implements OnInit {
  public validationErrorNames: string[];

  constructor(
    public dialogRef: MatDialogRef<ValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Record<string, ValidationErrorInterface>,
  ) {}

  ngOnInit(): void {
    this.validationErrorNames = Object.keys(this.data);
  }
}
