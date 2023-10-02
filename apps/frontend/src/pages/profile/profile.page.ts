import { API_URL } from '~shared/rest-api';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap, tap, takeUntil, map, withLatestFrom, filter } from 'rxjs/operators';
import { Subject, Observable, combineLatest } from 'rxjs';
import { ProfileService } from './services/profile.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Rewards } from './enums/rewards.enum';
import { ProfileCupInterface } from './interfaces/profile-cup.interface';
import { ProfileCupDtoInterface } from './dto/profile-cup.dto';
import { ProfileMainInfoInterface } from './interfaces/profile-main-info.interface';
import { ProfileInterface } from './interfaces/profile.interface';
import { ProfileDemosDtoInterface } from './dto/profile-demos.dto';
import { ProfileRewardsDtoInterface } from './dto/profile-rewards.dto';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileDialogComponent } from './components/edit-profile-dialog/edit-profile-dialog';
import { isNonNull } from '~shared/helpers';
import { UserInterface } from '~shared/interfaces/user.interface';
import { LanguageService } from '~shared/services/language/language.service';
import { UserService } from '~shared/services/user-service/user.service';
import { Physics } from '@dfcomps/contracts';

@Component({
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  public mainInfo: ProfileMainInfoInterface;
  public cpmChart: string[];
  public vq3Chart: string[];
  public demos: ProfileDemosDtoInterface[];
  public cups: ProfileCupInterface[];
  public rewards: Rewards[];
  public isLoading$ = new Subject<boolean>();
  public physics = Physics;
  public apiUrl = API_URL;
  public isEditProfileAvailable$: Observable<boolean>;
  public isNickChangeAllowed = false;
  public profileUpdate$ = new Subject<void>();

  private onDestroy$ = new Subject<void>();

  constructor(
    protected languageService: LanguageService,
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.isLoading$.next(true);
  }

  ngOnInit(): void {
    this.initObservables();
    this.setRouteSubscription();
    this.setProfileUpdateSubscription();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public getAvatarSrc(avatar: string, apiUrl: string): string {
    return avatar ? `/uploads/images/avatars/${avatar}.jpg` : `/uploads/images/avatars/no_avatar.png`;
  }

  public openEditProfilePopup(): void {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      data: {
        nick: this.mainInfo.nick,
        country: this.mainInfo.country,
      },
    });

    dialogRef.componentInstance.reloadProfile.subscribe(() => this.profileUpdate$.next());
  }

  private initObservables(): void {
    this.isEditProfileAvailable$ = combineLatest([
      this.activatedRoute.params,
      this.userService.getCurrentUser$().pipe(filter(isNonNull)),
    ]).pipe(map(([{ id }, user]: [Params, UserInterface]) => (user ? id === user.id : false)));
  }

  private setRouteSubscription(): void {
    this.activatedRoute.params
      .pipe(
        tap(() => this.isLoading$.next(true)),
        switchMap(({ id }: Params) => this.profileService.getProfile$(id)),
        takeUntil(this.onDestroy$),
      )
      .subscribe((profileInfo: ProfileInterface) => this.updateProfile(profileInfo));
  }

  private setProfileUpdateSubscription(): void {
    this.profileUpdate$
      .pipe(
        tap(() => this.isLoading$.next(true)),
        withLatestFrom(this.activatedRoute.params),
        switchMap(([, { id }]: [void, Params]) => this.profileService.getProfile$(id, false)),
        takeUntil(this.onDestroy$),
      )
      .subscribe((profileInfo: ProfileInterface) => this.updateProfile(profileInfo));
  }

  private updateProfile(profileInfo: ProfileInterface): void {
    this.mainInfo = profileInfo.player;
    this.cpmChart = profileInfo.rating.cpm;
    this.vq3Chart = profileInfo.rating.vq3;
    this.demos = profileInfo.demos;
    this.cups = this.mapCupsToView(profileInfo.cups);
    this.rewards = profileInfo.rewards.map(({ name }: ProfileRewardsDtoInterface) => name);

    this.sanitizer.bypassSecurityTrustResourceUrl(`/assets/images/avatars/${this.mainInfo.avatar}.jpg`);

    setTimeout(() => {
      this.isLoading$.next(false);
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  private mapCupsToView(cups: ProfileCupDtoInterface[]): ProfileCupInterface[] {
    return cups.map((cup: ProfileCupDtoInterface) => {
      const physics = cup.cpm_place === '0' ? Physics.VQ3 : Physics.CPM;

      return {
        newsId: cup.news_id,
        fullName: cup.full_name,
        shortName: cup.short_name,
        physics,
        resultPlace: physics === Physics.CPM ? +cup.cpm_place : +cup.vq3_place,
        ratingChange: physics === Physics.CPM ? +cup.cpm_change : +cup.vq3_change,
      };
    });
  }
}
