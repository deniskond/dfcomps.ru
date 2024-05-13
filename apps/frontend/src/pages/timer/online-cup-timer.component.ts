import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { OnlineCupInfoInterface } from '@dfcomps/contracts';
import { catchError, throwError } from 'rxjs';
import { CupsService } from '~shared/services/cups/cups.service';
import { LanguageService } from '~shared/services/language/language.service';

@Component({
  selector: 'online-cup-timer',
  templateUrl: './online-cup-timer.component.html',
  styleUrls: ['./online-cup-timer.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineCupTimerComponent implements OnInit {
  public placeholder: string = '?????';
  public currentMap: number = 0;
  public timerValue = 1800;
  public interval: ReturnType<typeof setInterval>;
  public onlineCupInfo: OnlineCupInfoInterface;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cupsService: CupsService,
    private snackBar: MatSnackBar,
    private languageService: LanguageService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const uuid: string = this.activatedRoute.snapshot.params['uuid'];

    this.cupsService
      .getOnlineCupInfo$(uuid)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.languageService.getTranslations$().subscribe((translations: Record<string, string>) => {
            this.snackBar.open(translations['error'], translations['onlineCupMapAreNotSet'], { duration: 3000 });
            this.router.navigate(['/']);
          });

          return throwError(() => error);
        }),
      )
      .subscribe((onlineCupInfo: OnlineCupInfoInterface) => {
        this.onlineCupInfo = onlineCupInfo;
        this.changeDetectorRef.markForCheck();
      });
  }

  get minutes(): number {
    return Math.floor(this.timerValue / 60);
  }

  get displayedMinutes(): string {
    return this.minutes < 10 ? `0${this.minutes}` : `${this.minutes}`;
  }

  get seconds(): number {
    return this.timerValue - this.minutes * 60;
  }

  get displayedSeconds(): string {
    return this.seconds < 10 ? `0${this.seconds}` : `${this.seconds}`;
  }

  setMap(n: number): void {
    clearInterval(this.interval);
    this.currentMap = n;
    this.timerValue = 1800;

    this.interval = setInterval(() => {
      this.timerValue--;
      this.changeDetectorRef.markForCheck();

      if (!this.timerValue) {
        clearInterval(this.interval);
      }
    }, 1000);
  }
}
