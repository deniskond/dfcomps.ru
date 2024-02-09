import { Component, Input, ChangeDetectionStrategy, OnChanges, OnInit } from '@angular/core';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { NewsStreamersResultsInterface } from '@dfcomps/contracts';
import { Observable, map, take } from 'rxjs';
import { UserService } from '~shared/services/user-service/user.service';

@Component({
  selector: 'app-news-streamers-results',
  templateUrl: './news-streamers-results.component.html',
  styleUrls: ['./news-streamers-results.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsStreamersResultsComponent implements OnInit {
  @Input() news: NewsStreamersResultsInterface;

  public showDemosForStreamersLink$: Observable<boolean>;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.showDemosForStreamersLink$ = this.userService.getCurrentUser$().pipe(
      take(1),
      map((user) => !!user && checkUserRoles(user.roles, [UserRoles.STREAMER])),
    );
  }

  public getStreamersArchive(): void {

  }
}
