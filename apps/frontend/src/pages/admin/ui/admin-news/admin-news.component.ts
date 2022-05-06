import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReplaySubject, switchMap, take } from 'rxjs';
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

  constructor(private adminDataService: AdminDataService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.adminDataService.getAllNews$().subscribe((news: AdminNewsInterface[]) => {
      this.news = news;
      this.news$.next(news);
    });
  }

  public confirmDelete(newsItem: AdminNewsInterface): void {
    const snackBar = this.snackBar.open(`Are you sure you want to delete "${newsItem.headeEnglish}"?`, 'Yes', {
      duration: 3000,
    });
    const snackBarActionSubscription = snackBar
      .onAction()
      .pipe(switchMap(() => this.adminDataService.deleteNewsItem$(newsItem.id)))
      .subscribe(() => {
        this.news = this.news.filter((item: AdminNewsInterface) => item.id !== newsItem.id);
        this.news$.next(this.news);
        this.snackBar.open(`Successfully deleted "${newsItem.headeEnglish}"!`, '', { duration: 1000 });
      });
  }
}
