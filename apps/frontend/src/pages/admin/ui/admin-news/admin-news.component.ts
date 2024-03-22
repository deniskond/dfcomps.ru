import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, Observable, ReplaySubject, switchMap, take } from 'rxjs';
import { isNonNull } from '../../../../shared/helpers';
import { AdminDataService } from '../../business/admin-data.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { UserService } from '~shared/services/user-service/user.service';
import { AdminNewsListInterface, NewsTypes } from '@dfcomps/contracts';
import * as moment from 'moment';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-news',
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsComponent implements OnInit {
  public news: AdminNewsListInterface[];
  public news$ = new ReplaySubject<AdminNewsListInterface[]>(1);
  public user$: Observable<UserInterface>;
  public newsTypes = Object.values(NewsTypes);
  public addNewsTypeSelectValue = NewsTypes.SIMPLE;

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.adminDataService.getAllNews$().subscribe((news: AdminNewsListInterface[]) => {
      this.news = news;
      this.news$.next(news);
    });

    this.user$ = this.userService.getCurrentUser$().pipe(filter(isNonNull));
  }

  public formatDateToLocal(date: string): string {
    return moment(date).local().format('YYYY-MM-DD HH:mm:ss') + ' (local)';
  }

  public confirmDelete(newsItem: AdminNewsListInterface): void {
    const snackBar = this.snackBar.open(`Are you sure you want to delete "${newsItem.headerEnglish}"?`, 'Yes', {
      duration: 3000,
    });

    snackBar
      .onAction()
      .pipe(
        take(1),
        switchMap(() => this.adminDataService.deleteNewsItem$(newsItem.id)),
      )
      .subscribe(() => {
        this.news = this.news.filter((item: AdminNewsListInterface) => item.id !== newsItem.id);
        this.news$.next(this.news);
        this.adminDataService.setNews(this.news);
        this.snackBar.open(`Successfully deleted "${newsItem.headerEnglish}"!`, '', { duration: 1000 });
      });
  }

  public getNewsTypeRoute(newsType: NewsTypes): string {
    const newsTypeRouteMap: Record<NewsTypes, string> = {
      [NewsTypes.SIMPLE]: 'simple',
      [NewsTypes.OFFLINE_START]: 'offline-start',
      [NewsTypes.OFFLINE_RESULTS]: 'offline-results',
      [NewsTypes.ONLINE_ANNOUNCE]: 'online-announce',
      [NewsTypes.ONLINE_RESULTS]: 'online-results',
      [NewsTypes.MULTICUP_RESULTS]: 'multicup-results',
      [NewsTypes.DFWC_RESULTS]: 'dfwc-results',
      [NewsTypes.STREAMERS_RESULTS]: 'streamers-results',
    };

    return newsTypeRouteMap[newsType];
  }

  public hasNewsDeleteAccess(user: UserInterface): boolean {
    return checkUserRoles(user.roles, [UserRoles.NEWSMAKER]);
  }

  public openAddNewsPage(): void {
    this.router.navigate([`/admin/news/add/${this.getNewsTypeRoute(this.addNewsTypeSelectValue)}`]);
  }

  public mapNewsTypeToHumanName(newsType: NewsTypes): string {
    const newsTypeHumanNameMap: Record<NewsTypes, string> = {
      [NewsTypes.SIMPLE]: 'Simple text news',
      [NewsTypes.OFFLINE_START]: 'Offline cup start',
      [NewsTypes.OFFLINE_RESULTS]: 'Offline cup results',
      [NewsTypes.ONLINE_ANNOUNCE]: 'Online cup announce',
      [NewsTypes.ONLINE_RESULTS]: 'Online cup results',
      [NewsTypes.MULTICUP_RESULTS]: 'Multicup results',
      [NewsTypes.DFWC_RESULTS]: 'DFWC round results',
      [NewsTypes.STREAMERS_RESULTS]: 'Results for streamers review',
    };

    return newsTypeHumanNameMap[newsType];
  }
}
