import { Languages } from '../../../../enums/languages.enum';
import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-download-df-dialog',
    templateUrl: './download-df-dialog.component.html',
    styleUrls: ['./download-df-dialog.component.less'],
})
export class DownloadDfDialogComponent extends Translations {
    public languages = Languages;

    constructor(public dialogRef: MatDialogRef<DownloadDfDialogComponent>, protected languageService: LanguageService) {
        super(languageService);
    }
}
