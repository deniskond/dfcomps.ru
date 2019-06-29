import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ValidationErrorInterface } from '../../../interfaces/validation-error.interface';

@Component({
    selector: 'app-validation-dialog',
    templateUrl: './validation-dialog.component.html',
    styleUrls: ['./validation-dialog.component.less'],
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
