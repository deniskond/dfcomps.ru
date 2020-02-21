import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { MAIN_URL } from '../../../../configs/url-params.config';
import { UploadDemoDtoInterface } from '../../../../services/demos/dto/upload-demo.dto';
import { UserInterface } from '../../../../interfaces/user.interface';
import { UserService } from '../../../../services/user-service/user.service';
import { DemosService } from '../../../../services/demos/demos.service';
import { NewsOfflineStartInterface } from '../../../../services/news-service/interfaces/news-offline-start.interface';
import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CupStates } from '../../../../enums/cup-states.enum';
import * as moment from 'moment';
import { finalize, take, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ReflexPlayerDemosDialogComponent } from './reflex-player-demos-dialog/reflex-player-demos-dialog.component';

@Component({
    selector: 'app-news-reflex-offline-start',
    templateUrl: './news-reflex-offline-start.component.html',
    styleUrls: ['./news-reflex-offline-start.component.less'],
})
export class NewsReflexOfflineStartComponent extends Translations implements OnInit {
    @Input()
    news: NewsOfflineStartInterface;

    @Output()
    reloadNews = new EventEmitter<void>();

    @ViewChild('fileInput') fileInput: ElementRef;

    public user$: Observable<UserInterface>;
    public cupState: CupStates;
    public cupStates = CupStates;
    public isUploading = false;
    public mainUrl = MAIN_URL;

    constructor(
        private demosService: DemosService,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        protected languageService: LanguageService,
    ) {
        super(languageService);
    }

    ngOnInit(): void {
        this.cupState = this.getCupState();
        this.user$ = this.userService.getCurrentUser$();
        super.ngOnInit();
    }

    public uploadDemo(): void {
        const demo: File = this.fileInput.nativeElement.files[0];

        if (!demo) {
            this.snackBar.open(this.translations.error, this.translations.noDemo, { duration: 3000 });

            return;
        }

        this.isUploading = true;

        this.user$
            .pipe(
                take(1),
                switchMap((user: UserInterface) =>
                    this.demosService.reflexUploadDemo$(demo, this.news.cup.id, this.news.cup.map1, user.id, demo.name),
                ),
                finalize(() => {
                    this.fileInput.nativeElement.value = null;
                    this.isUploading = false;
                }),
                catchError(() => {
                    this.snackBar.open(this.translations.error, this.translations.uploadFailed, { duration: 3000 });

                    return of();
                }),
            )
            .subscribe(({ status, validation, message }: UploadDemoDtoInterface) => {
                if (status === 'Success') {
                    this.snackBar.open(this.translations.success, this.translations.demoSent, { duration: 3000 });
                    this.reloadNews.emit();
                } else if (status === 'Error') {
                    this.snackBar.open(this.translations.error, message, { duration: 3000 });
                }
            });
    }

    public openPlayerDemosDialog(): void {
        const dialogRef = this.dialog.open(ReflexPlayerDemosDialogComponent, {
            data: {
                demos: this.news.playerDemos,
                cupName: this.news.cup.fullName,
                cupId: this.news.cup.id,
            },
        });

        const demoDeleteSubscription = dialogRef.componentInstance.reloadNews.subscribe(() => this.reloadNews.emit());

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe(() => demoDeleteSubscription.unsubscribe());
    }

    private getCupState(): CupStates {
        const startTime = +this.news.cup.startTime;
        const endTime = +this.news.cup.endTime;
        const currentTime = +moment().format('X');

        if (currentTime < startTime) {
            return CupStates.NOT_STARTED;
        }

        if (currentTime > endTime) {
            return CupStates.FINISHED;
        }

        return CupStates.IN_PROGRESS;
    }
}
