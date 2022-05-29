import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, Observable, ReplaySubject, switchMap, take } from 'rxjs';
import { NewsTypes } from '../../../../app/enums/news-types.enum';
import { UserAccess } from '../../../../app/enums/user-access.enum';
import { UserInterface } from '../../../../app/interfaces/user.interface';
import { UserService } from '../../../../app/services/user-service/user.service';
import { isNonNull } from '../../../../shared/helpers';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminNewsInterface } from '../../models/admin-news.interface';

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
  public userAccess = UserAccess;

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
    };

    return newsTypeRouteMap[newsType];
  }
}
