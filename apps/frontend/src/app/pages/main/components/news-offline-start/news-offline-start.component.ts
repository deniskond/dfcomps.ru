import { LanguageService } from '../../../../services/language/language.service';
import { MAIN_URL } from '../../../../configs/url-params.config';
import { UploadDemoDtoInterface } from '../../../../services/demos/dto/upload-demo.dto';
import { UserInterface } from '../../../../interfaces/user.interface';
import { UserService } from '../../../../services/user-service/user.service';
import { DemosService } from '../../../../services/demos/demos.service';
import { NewsOfflineStartInterface } from '../../../../services/news-service/interfaces/news-offline-start.interface';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CupStates } from '../../../../enums/cup-states.enum';
import * as moment from 'moment';
import { finalize, take, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidationDialogComponent } from './validation-dialog/validation-dialog.component';
import { PlayerDemosDialogComponent } from './player-demos-dialog/player-demos-dialog.component';
import { DemoUploadResult } from '../../../../services/demos/enums/demo-upload-result.enum';
import { OverbouncesWarningDialogComponent } from './overbounces-warning-dialog/overbounces-warning-dialog.component';

const SNACKBAR_DURATION = 3000;

@Component({
  selector: 'app-news-offline-start',
  templateUrl: './news-offline-start.component.html',
  styleUrls: ['./news-offline-start.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsOfflineStartComponent implements OnInit {
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
    private languageService: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cupState = this.getCupState();
    this.user$ = this.userService.getCurrentUser$();
  }

  public uploadDemo(): void {
    const demo: File = this.fileInput.nativeElement.files[0];

    if (!demo) {
      this.openSnackBar('error', 'noDemo');

      return;
    }

    if (!demo.name.toLowerCase().includes(this.news.cup.map1.toLowerCase())) {
      this.openSnackBar('error', 'wrongMap');

      return;
    }

    this.isUploading = true;

    this.user$
      .pipe(
        take(1),
        switchMap((user: UserInterface) =>
          this.demosService.uploadDemo$(demo, this.news.cup.id, this.news.cup.map1, user.id, demo.name),
        ),
        finalize(() => {
          this.fileInput.nativeElement.value = null;
          this.isUploading = false;
          this.changeDetectorRef.markForCheck();
        }),
        catchError(() => {
          this.openSnackBar('error', 'uploadFailed');

          return of();
        }),
      )
      .subscribe(({ status, errors, warnings, message }: UploadDemoDtoInterface) => {
        if (status === DemoUploadResult.SUCCESS) {
          this.openSnackBar('success', 'demoSent');
          this.reloadNews.emit();

          if (warnings!.length) {
            this.dialog.open(OverbouncesWarningDialogComponent);
          }
        } else if (status === DemoUploadResult.ERROR) {
          this.openSnackBar('error', message!, false);
        } else if (status === DemoUploadResult.INVALID) {
          this.dialog.open(ValidationDialogComponent, {
            data: errors,
          });
        }
      });
  }

  public openPlayerDemosDialog(): void {
    const dialogRef = this.dialog.open(PlayerDemosDialogComponent, {
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
    const startTime: string = this.news.cup.startDateTime;
    const endTime: string = this.news.cup.endDateTime;

    if (moment().isBefore(moment(startTime))) {
      return CupStates.NOT_STARTED;
    }

    if (moment().isAfter(moment(endTime))) {
      return CupStates.FINISHED;
    }

    return CupStates.IN_PROGRESS;
  }

  private openSnackBar(title: string, message: string, needMessageTranslation = true): void {
    this.languageService
      .getTranslations$()
      .pipe(take(1))
      .subscribe((translations: Record<string, string>) => {
        const snackBarMessage = needMessageTranslation ? translations[message] : message;

        this.snackBar.open(translations[title], snackBarMessage, { duration: SNACKBAR_DURATION });
      });
  }
}
