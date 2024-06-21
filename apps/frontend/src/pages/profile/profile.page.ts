import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap, tap, takeUntil, map, withLatestFrom } from 'rxjs/operators';
import { Subject, Observable, combineLatest } from 'rxjs';
import { ProfileService } from './services/profile.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfileCupInterface } from './interfaces/profile-cup.interface';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileDialogComponent } from './components/edit-profile-dialog/edit-profile-dialog';
import { UserInterface } from '~shared/interfaces/user.interface';
import { LanguageService } from '~shared/services/language/language.service';
import { UserService } from '~shared/services/user-service/user.service';
import {
  Physics,
  ProfileCupResponseInterface,
  ProfileDemosInterface,
  ProfileInterface,
  ProfileMainInfoInterface,
  ProfileRewardsInterface,
  Rewards,
} from '@dfcomps/contracts';

@Component({
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  public mainInfo: ProfileMainInfoInterface;
  public cpmChart: number[];
  public vq3Chart: number[];
  public demos: ProfileDemosInterface[];
  public cups: ProfileCupInterface[];
  public rewards: Rewards[];
  public isLoading$ = new Subject<boolean>();
  public physics = Physics;
  public isEditProfileAvailable$: Observable<boolean>;
  public isNickChangeAllowed = false;
  public profileUpdate$ = new Subject<void>();
  public isDiscordLinkButtonShown$: Observable<boolean>;

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

  public getAvatarSrc(avatar: string): string {
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

  public linkDiscord(): void {
    window.location.href =
      'https://discord.com/oauth2/authorize?response_type=token&client_id=1154028126783946772&scope=identify&state=link';
  }

  private initObservables(): void {
    this.isEditProfileAvailable$ = combineLatest([this.activatedRoute.params, this.userService.getCurrentUser$()]).pipe(
      map(([{ id }, user]: [Params, UserInterface | null]) => (user ? +id === user.id : false)),
    );

    this.isDiscordLinkButtonShown$ = combineLatest([
      this.activatedRoute.params,
      this.userService.getCurrentUser$(),
    ]).pipe(
      map(([{ id }, user]: [Params, UserInterface | null]) => (user ? +id === user.id && !user.discordTag : false)),
    );
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
    this.rewards = profileInfo.rewards.map(({ name }: ProfileRewardsInterface) => name);

    this.sanitizer.bypassSecurityTrustResourceUrl(`/assets/images/avatars/${this.mainInfo.avatar}.jpg`);

    setTimeout(() => {
      this.isLoading$.next(false);
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  private mapCupsToView(cups: ProfileCupResponseInterface[]): ProfileCupInterface[] {
    return cups.map((cup: ProfileCupResponseInterface) => {
      const physics = cup.cpm_place ? Physics.CPM : Physics.VQ3;

      return {
        newsId: cup.news_id,
        fullName: cup.full_name,
        shortName: cup.short_name,
        physics,
        resultPlace: physics === Physics.CPM ? cup.cpm_place! : cup.vq3_place!,
        ratingChange: physics === Physics.CPM ? cup.cpm_change! : cup.vq3_change!,
      };
    });
  }
}
