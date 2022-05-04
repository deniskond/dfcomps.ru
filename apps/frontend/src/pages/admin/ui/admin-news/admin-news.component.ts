import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { Observable } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';

@Component({
  selector: 'admin-news',
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsComponent implements OnInit {
  public news$: Observable<any>;

  constructor(private adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.news$ = this.adminDataService.getAllNews$();
  }

  public getHumanTime(time: string): string {
    return moment(time).tz('Russia/Moscow').format('DD.MM.YYYY HH:mm') + ' MSK';
  }

  public getNewsType(type: number): string {
    return {
      1: 'Online cup results',
      2: 'Online cup announcement',
      3: 'Text',
      4: 'Offline cup start',
      5: 'Offline cup results',
      6: 'Multicup results',
      7: 'DFWC round results',
      8: 'Legacy',
      9: 'Legacy',
    }[type]!;
  }
}
