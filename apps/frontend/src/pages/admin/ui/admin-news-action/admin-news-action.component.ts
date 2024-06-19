import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminOperationType } from '../../models/admin-operation-type.enum';
import * as moment from 'moment-timezone';
import { combineLatest, map, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import {
  AdminActiveCupInterface,
  AdminActiveMulticupInterface,
  AdminEditNewsInterface,
  CupTypes,
  Languages,
  NewsStreamInterface,
  NewsTypes,
  StreamingPlatforms,
  UploadedFileLinkInterface,
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
  @ViewChild('imageFileInput') imageFileInput: ElementRef;

  public operationType: AdminOperationType;
  public newsActionForm: FormGroup;
  public isCupRequired: boolean;
  public isMulticupRequired: boolean;
  public availableMulticups$: Observable<AdminActiveMulticupInterface[]>;
  public availableCups$: Observable<AdminActiveCupInterface[]>;
  public mapNewsTypeToHumanTitle = mapNewsTypeToHumanTitle;
  public newsType: NewsTypes;
  public cupsList$: Observable<AdminActiveCupInterface[]>;
  public streamsFormArray = new FormArray<FormGroup>([]);
  public range = (length: number) => new Array(+length).fill(null);
  public streamingPlatforms = Object.values(StreamingPlatforms);
  public languages = Languages;

  private newsId: string;
  private selectedCup$: ReplaySubject<AdminActiveCupInterface | null> = new ReplaySubject(1);

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

    if (this.newsType === NewsTypes.ONLINE_ANNOUNCE || this.newsType === NewsTypes.ONLINE_RESULTS) {
      this.availableCups$ = this.adminDataService.getAllCupsWithoutNews$(CupTypes.ONLINE, this.newsType);
    }

    if (
      this.newsType === NewsTypes.OFFLINE_START ||
      this.newsType === NewsTypes.OFFLINE_RESULTS ||
      this.newsType === NewsTypes.STREAMERS_RESULTS
    ) {
      this.availableCups$ = this.adminDataService.getAllCupsWithoutNews$(CupTypes.OFFLINE, this.newsType);
    }

    this.initForm();

    this.cupsList$ = combineLatest([this.availableCups$, this.selectedCup$]).pipe(
      map(([availableCups, selectedCup]: [AdminActiveCupInterface[], AdminActiveCupInterface | null]) =>
        selectedCup ? [selectedCup, ...availableCups] : [...availableCups],
      ),
    );
  }

  public submitNews(): void {
    Object.keys(this.newsActionForm.controls).forEach((key: string) => this.newsActionForm.get(key)!.markAsDirty());

    this.streamsFormArray.controls.forEach((formGroup: FormGroup) => {
      Object.keys(formGroup.controls).forEach((key: string) => formGroup.get(key)!.markAsDirty());
    });

    if (!this.newsActionForm.valid || !this.streamsFormArray.valid) {
      return;
    }

    const imageUploadStream$: Observable<UploadedFileLinkInterface | null> = this.imageFileInput.nativeElement.files[0]
      ? this.adminDataService.uploadNewsImage$(this.imageFileInput.nativeElement.files[0]).pipe(
          tap(({ link }: UploadedFileLinkInterface) => {
            this.newsActionForm.get('imageLink')!.setValue(link);
          }),
        )
      : of(null);

    if (this.operationType === AdminOperationType.ADD) {
      imageUploadStream$
        .pipe(
          switchMap(() =>
            this.adminDataService.postNews$(
              this.newsActionForm.value,
              this.newsType,
              this.streamsFormArray.value as NewsStreamInterface[],
            ),
          ),
          switchMap(() => this.adminDataService.getAllNews$(false)),
        )
        .subscribe(() => {
          this.router.navigate(['/admin/news']);
          this.snackBar.open('News added successfully', 'OK', { duration: 3000 });
        });
    }

    if (this.operationType === AdminOperationType.EDIT) {
      imageUploadStream$
        .pipe(
          switchMap(() =>
            this.adminDataService.editNews$(
              this.newsActionForm.value,
              this.newsId,
              this.newsType,
              this.streamsFormArray.value as NewsStreamInterface[],
            ),
          ),
          switchMap(() => this.adminDataService.getAllNews$(false)),
        )
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

  public addStream(): void {
    this.streamsFormArray.push(
      new FormGroup({
        platform: new FormControl(StreamingPlatforms.YOUTUBE, [Validators.required]),
        streamId: new FormControl('', [Validators.required]),
        streamer: new FormControl('', [Validators.required]),
        language: new FormControl(Languages.RU, [Validators.required]),
      }),
    );
  }

  public deleteStream(streamIndex: number): void {
    this.streamsFormArray.removeAt(streamIndex);
  }

  public focusInput(event: any): void {
    const targetElement = event.target as HTMLDivElement;

    (targetElement.parentElement?.getElementsByTagName('input')[0] as HTMLInputElement).focus();
  }

  public getStreamLinkPrefix(platform: StreamingPlatforms): string {
    return {
      [StreamingPlatforms.TWITCH_CHANNEL]: 'https://player.twitch.tv/?channel=',
      [StreamingPlatforms.TWITCH_VIDEO]: 'https://player.twitch.tv/?video=',
      [StreamingPlatforms.YOUTUBE]: 'https://youtube.com/?v=',
    }[platform];
  }

  public mapStreamingPlatformName(platform: StreamingPlatforms): string {
    return {
      [StreamingPlatforms.TWITCH_CHANNEL]: 'Twitch channel',
      [StreamingPlatforms.TWITCH_VIDEO]: 'Twitch video',
      [StreamingPlatforms.YOUTUBE]: 'YouTube',
    }[platform];
  }

  public deleteImage(): void {
    this.newsActionForm.get('imageLink')!.setValue(null);
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
          russianText: new FormControl(''),
          englishText: new FormControl(''),
          cup: new FormControl(null),
          multicup: new FormControl(null),
          imageLink: new FormControl(null),
        },
        this.postingTimeValidator(),
      );

      this.selectedCup$.next(null);
    }

    if (this.operationType === AdminOperationType.EDIT) {
      this.adminDataService.getSingleNews$(this.newsId).subscribe((singleNews: AdminEditNewsInterface) => {
        this.newsActionForm = new FormGroup(
          {
            russianTitle: new FormControl(singleNews.newsItem.headerRussian, Validators.required),
            englishTitle: new FormControl(singleNews.newsItem.headerEnglish, Validators.required),
            timeOption: new FormControl('custom', Validators.required),
            postingTime: new FormControl(this.mapDateTimeZoneToInput(singleNews.newsItem.date)),
            russianText: new FormControl(singleNews.newsItem.textRussian),
            englishText: new FormControl(singleNews.newsItem.textEnglish),
            cup: new FormControl(singleNews.newsItem.cup?.cupId),
            multicup: new FormControl(singleNews.newsItem.multicupId),
            imageLink: new FormControl(singleNews.newsItem.imageLink),
          },
          this.postingTimeValidator(),
        );

        singleNews.newsItem.streams.forEach((stream: NewsStreamInterface) => {
          this.streamsFormArray.push(
            new FormGroup({
              platform: new FormControl(stream.platform, [Validators.required]),
              streamId: new FormControl(stream.streamId, [Validators.required]),
              streamer: new FormControl(stream.streamer, [Validators.required]),
              language: new FormControl(stream.language, [Validators.required]),
            }),
          );
        });

        this.selectedCup$.next(singleNews.newsItem.cup);
        this.changeDetectorRef.markForCheck();
      });
    }
  }
}
