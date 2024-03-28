import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminOperationType } from '../../models/admin-operation-type.enum';
import * as moment from 'moment-timezone';
import { debounceTime, Observable, startWith, switchMap } from 'rxjs';
import {
  AdminActiveCupInterface,
  AdminActiveMulticupInterface,
  AdminEditNewsInterface,
  NewsTypes,
} from '@dfcomps/contracts';
import { AdminNewsRouting } from '../../models/admin-news-routing.enum';
import { mapNewsTypeToHumanTitle } from '../../business/admin-news-types.mapper';

const newsTypesWithRequiredCup: NewsTypes[] = [
  NewsTypes.OFFLINE_START,
  NewsTypes.OFFLINE_RESULTS,
  NewsTypes.ONLINE_ANNOUNCE,
  NewsTypes.ONLINE_RESULTS,
  NewsTypes.STREAMERS_RESULTS,
];

@Component({
  selector: 'admin-news-action',
  templateUrl: './admin-news-action.component.html',
  styleUrls: ['./admin-news-action.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsActionComponent implements OnInit {
  public operationType: AdminOperationType;
  public newsActionForm: FormGroup;
  public youtubeEmbedId$: Observable<string>;
  public isCupRequired: boolean;
  public isMulticupRequired: boolean;
  public availableMulticups$: Observable<AdminActiveMulticupInterface[]>;
  public availableCups$: Observable<AdminActiveCupInterface[]>;
  public mapNewsTypeToHumanTitle = mapNewsTypeToHumanTitle;
  public newsType: NewsTypes;
  private newsId: string;

  constructor(
    private adminDataService: AdminDataService,
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.operationType = this.activatedRoute.snapshot.params['action'];
    this.newsId = this.activatedRoute.snapshot.params['id'];
    this.newsType = this.mapNewsRouteToEnum(this.activatedRoute.snapshot.params['newsType']);
    this.isCupRequired = newsTypesWithRequiredCup.some((newsType: NewsTypes) => newsType === this.newsType);
    this.isMulticupRequired = this.newsType === NewsTypes.MULTICUP_RESULTS;

    if (this.isMulticupRequired) {
      this.availableMulticups$ = this.adminDataService.getAllAvailableMulticups$();
    }

    if (
      this.isCupRequired &&
      (this.newsType === NewsTypes.ONLINE_ANNOUNCE || this.newsType === NewsTypes.ONLINE_RESULTS)
    ) {
      this.availableCups$ = this.adminDataService.getAllOnlineCupsWithoutNews$();
    }

    if (
      this.isCupRequired &&
      (this.newsType === NewsTypes.OFFLINE_START || this.newsType === NewsTypes.OFFLINE_RESULTS)
    ) {
      this.availableCups$ = this.adminDataService.getAllOfflineCupsWithoutNews$();
    }

    this.initForm();
  }

  public submitNews(): void {
    Object.keys(this.newsActionForm.controls).forEach((key: string) => this.newsActionForm.get(key)!.markAsDirty());

    if (!this.newsActionForm.valid) {
      return;
    }

    if (this.operationType === AdminOperationType.ADD) {
      this.adminDataService
        .postNews$(this.newsActionForm.value, this.newsType)
        .pipe(switchMap(() => this.adminDataService.getAllNews$(false)))
        .subscribe(() => {
          this.router.navigate(['/admin/news']);
          this.snackBar.open('News added successfully', 'OK', { duration: 3000 });
        });
    }

    if (this.operationType === AdminOperationType.EDIT) {
      this.adminDataService
        .editNews$(this.newsActionForm.value, this.newsId, this.newsType)
        .pipe(switchMap(() => this.adminDataService.getAllNews$(false)))
        .subscribe(() => {
          this.router.navigate(['/admin/news']);
          this.snackBar.open('News edited successfully', 'OK', { duration: 3000 });
        });
    }
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }

  public postingTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const timeOption: string = control.get('timeOption')!.value;

      if (timeOption === 'now') {
        return null;
      }

      if (control.get('postingTime')!.value) {
        return null;
      }

      return { postingTimeEmpty: { value: control.get('postingTime')!.value } };
    };
  }

  // TODO Move out to mappers after typization
  private mapDateTimeZoneToInput(datetimezone: string): string {
    return moment(datetimezone).tz('Europe/Moscow').format('YYYY-MM-DDTHH:mm');
  }

  private mapNewsRouteToEnum(newsRoute: AdminNewsRouting): NewsTypes {
    return {
      [AdminNewsRouting.DFWC_ROUND_RESULTS]: NewsTypes.DFWC_ROUND_RESULTS,
      [AdminNewsRouting.MULTICUP_RESULTS]: NewsTypes.MULTICUP_RESULTS,
      [AdminNewsRouting.OFFLINE_RESULTS]: NewsTypes.OFFLINE_RESULTS,
      [AdminNewsRouting.OFFLINE_START]: NewsTypes.OFFLINE_START,
      [AdminNewsRouting.ONLINE_ANNOUNCE]: NewsTypes.ONLINE_ANNOUNCE,
      [AdminNewsRouting.ONLINE_RESULTS]: NewsTypes.ONLINE_RESULTS,
      [AdminNewsRouting.SIMPLE]: NewsTypes.SIMPLE,
      [AdminNewsRouting.STREAMERS_RESULTS]: NewsTypes.STREAMERS_RESULTS,
    }[newsRoute];
  }

  private initForm(): void {
    if (this.operationType === AdminOperationType.ADD) {
      this.newsActionForm = new FormGroup(
        {
          russianTitle: new FormControl('', Validators.required),
          englishTitle: new FormControl('', Validators.required),
          timeOption: new FormControl('now', Validators.required),
          postingTime: new FormControl(''),
          russianText: new FormControl('', Validators.required),
          englishText: new FormControl('', Validators.required),
          youtube: new FormControl(''),
          cup: new FormControl(null),
        },
        this.postingTimeValidator(),
      );

      this.setYoutubeFieldObservable();
    }

    if (this.operationType === AdminOperationType.EDIT) {
      this.adminDataService.getSingleNews$(this.newsId).subscribe((singleNews: AdminEditNewsInterface) => {
        this.newsActionForm = new FormGroup(
          {
            russianTitle: new FormControl(singleNews.newsItem.headerRussian, Validators.required),
            englishTitle: new FormControl(singleNews.newsItem.headerEnglish, Validators.required),
            timeOption: new FormControl('custom', Validators.required),
            postingTime: new FormControl(this.mapDateTimeZoneToInput(singleNews.newsItem.date)),
            russianText: new FormControl(singleNews.newsItem.textRussian, Validators.required),
            englishText: new FormControl(singleNews.newsItem.textEnglish, Validators.required),
            youtube: new FormControl(singleNews.newsItem.youtube),
            cup: new FormControl(singleNews.newsItem.cupId),
          },
          this.postingTimeValidator(),
        );

        this.changeDetectorRef.markForCheck();
        this.setYoutubeFieldObservable();
      });
    }
  }

  private setYoutubeFieldObservable(): void {
    this.youtubeEmbedId$ = this.newsActionForm
      .get('youtube')!
      .valueChanges.pipe(debounceTime(300), startWith(this.newsActionForm.get('youtube')!.value));
  }
}
