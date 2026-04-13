import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs';
import { DemoUploadResult, UploadDemoResponseInterface, WrPlayerSearchItemInterface } from '@dfcomps/contracts';
import { UserInterface } from '~shared/interfaces/user.interface';
import { UserService } from '~shared/services/user-service/user.service';
import { WrDatabaseService } from '../../services/wr-database.service';
import { ValidationDialogComponent } from '~shared/components/validation-dialog/validation-dialog.component';
import { LanguageService } from '~shared/services/language/language.service';

export enum WrPlayerType {
  MY_DEMO = 'MY_DEMO',
  DFCOMPS_USER = 'DFCOMPS_USER',
  DF_NAME = 'DF_NAME',
}

@Component({
  selector: 'app-wr-upload-block',
  templateUrl: './wr-upload-block.component.html',
  styleUrls: ['./wr-upload-block.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WrUploadBlockComponent implements OnInit, OnDestroy {
  @Output() uploadSuccess = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @ViewChild('playerInput') playerInput: ElementRef<HTMLInputElement>;

  public user$: Observable<UserInterface | null>;
  public playerType = WrPlayerType.MY_DEMO;
  public wrPlayerTypes = WrPlayerType;
  public isUploading = false;
  public playerSearchControl = new FormControl('');
  public filteredPlayers: WrPlayerSearchItemInterface[] = [];
  public selectedPlayer: WrPlayerSearchItemInterface | null = null;
  public chooseDemoText: string;
  public choosePlayerText: string;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private wrDatabaseService: WrDatabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.user$ = this.userService.getCurrentUser$();

    this.playerSearchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((value): value is string => typeof value === 'string' && value.length >= 2),
        switchMap((value) => this.wrDatabaseService.searchPlayers$(value)),
        takeUntil(this.destroy$),
      )
      .subscribe((players) => {
        this.filteredPlayers = players;
        this.changeDetectorRef.markForCheck();
      });

    this.languageService
      .getTranslations$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((translations) => {
        this.chooseDemoText = translations['chooseDemo'];
        this.choosePlayerText = translations['choosePlayer'];
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onPlayerTypeChange(): void {
    this.selectedPlayer = null;
    this.playerSearchControl.setValue('');
    this.filteredPlayers = [];
  }

  public onPlayerSelected(player: WrPlayerSearchItemInterface): void {
    this.selectedPlayer = player;
    this.playerSearchControl.setValue(player.nick, { emitEvent: false });
    this.filteredPlayers = [];

    setTimeout(() => {
      this.playerInput.nativeElement.blur();
      this.changeDetectorRef.markForCheck();
    }, 0);
  }

  public displayPlayerFn(player: WrPlayerSearchItemInterface | string | null): string {
    if (!player) {
      return '';
    }

    if (typeof player === 'string') {
      return player;
    }

    return player.nick;
  }

  public onFileSelected(): void {
    this.changeDetectorRef.markForCheck();
  }

  public upload(): void {
    const files = this.fileInput?.nativeElement?.files;

    if (!files?.length) {
      this.snackBar.open('Please select a demo file', 'OK', { duration: 3000 });
      return;
    }

    if (this.playerType === WrPlayerType.DFCOMPS_USER && !this.selectedPlayer) {
      this.snackBar.open('Please select a player from the list', 'OK', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.changeDetectorRef.markForCheck();

    const userId = this.playerType === WrPlayerType.DFCOMPS_USER ? this.selectedPlayer!.id : undefined;

    this.wrDatabaseService
      .uploadWrDemo$(files[0], this.playerType, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UploadDemoResponseInterface) => {
          this.isUploading = false;
          this.fileInput.nativeElement.value = '';
          this.changeDetectorRef.markForCheck();

          if (response.status === DemoUploadResult.SUCCESS) {
            this.snackBar.open('World record uploaded successfully!', 'OK', { duration: 4000 });
            this.uploadSuccess.emit();
          } else if (response.status === DemoUploadResult.INVALID) {
            this.dialog.open(ValidationDialogComponent, { data: response.errors });
          } else {
            this.snackBar.open(response.message || 'Upload failed', 'OK', { duration: 5000 });
          }
        },
        error: () => {
          this.isUploading = false;
          this.changeDetectorRef.markForCheck();
          this.snackBar.open('Upload error. Please try again.', 'OK', { duration: 5000 });
        },
      });
  }
}
