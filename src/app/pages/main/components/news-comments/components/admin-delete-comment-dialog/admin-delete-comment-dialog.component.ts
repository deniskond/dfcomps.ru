import { LanguageService } from '../../../../../../services/language/language.service';
import { Translations } from '../../../../../../components/translations/translations.component';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-admin-delete-comment-dialog',
    templateUrl: './admin-delete-comment-dialog.component.html',
    styleUrls: ['./admin-delete-comment-dialog.component.less'],
})
export class AdminDeleteCommentDialogComponent extends Translations {
    public reasonForm = new FormGroup({
        reason: new FormControl('', Validators.required),
    });

    constructor(
        public dialogRef: MatDialogRef<AdminDeleteCommentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { reason: string },
        protected languageService: LanguageService,
    ) {
        super(languageService);
    }

    public onSaveClick(): void {
        this.dialogRef.close(this.reasonForm.get('reason').value);
    }
}
