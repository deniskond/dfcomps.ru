import { LanguageService } from '../../../../services/language/language.service';
import { MAIN_URL } from '~shared/rest-api';
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
} from '@angular/core';
import { CupStates } from '../../../../enums/cup-states.enum';
import * as moment from 'moment';
import { finalize, take, switchMap, catchError, filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReflexPlayerDemosDialogComponent } from './reflex-player-demos-dialog/reflex-player-demos-dialog.component';
import { isNonNull } from '../../../../../shared/helpers/is-non-null';

const SNACKBAR_DURATION = 3000;

@Component({
  selector: 'app-news-reflex-offline-start',
  templateUrl: './news-reflex-offline-start.component.html',
  styleUrls: ['./news-reflex-offline-start.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsReflexOfflineStartComponent implements OnInit {
  @Input()
  news: NewsOfflineStartInterface;

  @Output()
  reloadNews = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput: ElementRef;

  public user$: Observable<UserInterface | null>;
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

    this.isUploading = true;

    this.user$
      .pipe(
        filter(isNonNull),
        take(1),
        switchMap((user: UserInterface) =>
          this.demosService.reflexUploadDemo$(demo, this.news.cup.id, this.news.cup.map1, user.id, demo.name),
        ),
        finalize(() => {
          this.fileInput.nativeElement.value = null;
          this.isUploading = false;
        }),
        catchError(() => {
          this.openSnackBar('error', 'uploadFailed');

          return of();
        }),
      )
      .subscribe(({ status, message }: UploadDemoDtoInterface) => {
        if (status === 'Success') {
          this.openSnackBar('success', 'demoSent');
          this.reloadNews.emit();
        } else if (status === 'Error') {
          this.openSnackBar('error', message!, false);
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
