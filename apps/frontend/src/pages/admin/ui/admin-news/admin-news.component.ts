import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, Observable, ReplaySubject, switchMap, take } from 'rxjs';
import { isNonNull } from '../../../../shared/helpers';
import { AdminDataService } from '../../business/admin-data.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { UserService } from '~shared/services/user-service/user.service';
import { checkUserRoles } from '~shared/helpers/check-roles';
import { AdminNewsInterface, NewsTypes, UserRole } from '@dfcomps/contracts';
import * as moment from 'moment';

@Component({
  selector: 'admin-news',
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsComponent implements OnInit {
  public news: AdminNewsInterface[];
  public news$ = new ReplaySubject<AdminNewsInterface[]>(1);
  public user$: Observable<UserInterface>;

  constructor(
    private adminDataService: AdminDataService,
    private snackBar: MatSnackBar,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.adminDataService.getAllNews$().subscribe((news: AdminNewsInterface[]) => {
      this.news = news;
      this.news$.next(news);
    });

    this.user$ = this.userService.getCurrentUser$().pipe(filter(isNonNull));
  }

  public formatDateToLocal(date: string): string {
    return moment(date).local().format('YYYY-MM-DD HH:mm:ss') + ' (local)';
  }

  public confirmDelete(newsItem: AdminNewsInterface): void {
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
        this.news = this.news.filter((item: AdminNewsInterface) => item.id !== newsItem.id);
        this.news$.next(this.news);
        this.adminDataService.setNews(this.news);
        this.snackBar.open(`Successfully deleted "${newsItem.headerEnglish}"!`, '', { duration: 1000 });
      });
  }

  public getNewsTypeRoute(newsType: NewsTypes): string | undefined {
    // TODO Remove Partial and add all routes
    const newsTypeRouteMap: Partial<Record<NewsTypes, string>> = {
      // [NewsTypes.OFFLINE_START]: 'offline-start',
      [NewsTypes.SIMPLE]: 'simple',
      [NewsTypes.OFFLINE_START]: 'simple',
      [NewsTypes.OFFLINE_RESULTS]: 'simple',
    };

    return newsTypeRouteMap[newsType];
  }

  public hasNewsDeleteAccess(user: UserInterface): boolean {
    return checkUserRoles(user, [UserRole.NEWSMAKER]);
  }
}
