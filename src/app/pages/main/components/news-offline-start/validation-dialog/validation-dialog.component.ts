import { Translations } from '../../../../../components/translations/translations.component';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ValidationErrorInterface } from '../../../interfaces/validation-error.interface';
import { LanguageService } from '../../../../../services/language/language.service';

@Component({
    selector: 'app-validation-dialog',
    templateUrl: './validation-dialog.component.html',
    styleUrls: ['./validation-dialog.component.less'],
})
export class ValidationDialogComponent extends Translations implements OnInit {
    public validationErrorNames: string[];

    constructor(
        public dialogRef: MatDialogRef<ValidationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Record<string, ValidationErrorInterface>,
        protected languageService: LanguageService,
    ) {
        super(languageService);
    }

    ngOnInit(): void {
        this.validationErrorNames = Object.keys(this.data);
    }
}
