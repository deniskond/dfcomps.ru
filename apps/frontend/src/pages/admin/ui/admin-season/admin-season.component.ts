import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CurrentSeasonService } from '@frontend/shared/rest-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'admin-season',
  templateUrl: './admin-season.component.html',
  styleUrls: ['./admin-season.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSeasonComponent implements OnInit {
  public currentSeason$: Observable<number>;

  constructor(private currentSeasonService: CurrentSeasonService) {}

  ngOnInit(): void {
    this.currentSeason$ = this.currentSeasonService.getCurrentSeason$();
  }
}
