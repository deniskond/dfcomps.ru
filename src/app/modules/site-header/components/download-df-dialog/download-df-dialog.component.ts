import { MAIN_URL } from '../../../../configs/url-params.config';
import { Languages } from '../../../../enums/languages.enum';
import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-download-df-dialog',
    templateUrl: './download-df-dialog.component.html',
    styleUrls: ['./download-df-dialog.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadDfDialogComponent extends Translations {
    public languages = Languages;
    public mainUrl = MAIN_URL;

    constructor(public dialogRef: MatDialogRef<DownloadDfDialogComponent>, protected languageService: LanguageService) {
        super(languageService);
    }
}
