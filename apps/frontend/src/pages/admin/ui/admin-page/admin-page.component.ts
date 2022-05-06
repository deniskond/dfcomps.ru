import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminCurrentPageService } from '../../business/admin-current-page.service';

@Component({
  selector: 'admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent implements OnInit {
  public currentPage$: Observable<string>;
  public navigationPage$: Observable<string>;

  constructor(private router: Router, private adminCurrentPageService: AdminCurrentPageService) {}

  ngOnInit(): void {
    this.adminCurrentPageService.setRouteSubscription();
    this.currentPage$ = this.adminCurrentPageService.currentPage$;
    this.navigationPage$ = this.adminCurrentPageService.navigationPage$;
  }

  ngOnDestroy(): void {
    this.adminCurrentPageService.unsetRouteSubscription();
  }
}
