import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { API_URL } from '~shared/rest-api';
import { isNonNull } from '../../../../shared/helpers/is-non-null';
import { AdminCurrentPageService } from '../../business/admin-current-page.service';
import { UserService } from '~shared/services/user-service/user.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { checkUserRoles } from '~shared/helpers/check-roles';
import { UserRole } from '@dfcomps/contracts';

@Component({
  selector: 'admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent implements OnInit {
  public currentPage$: Observable<string>;
  public navigationPage$: Observable<string>;
  public user$: Observable<UserInterface>;
  public apiUrl: string;

  constructor(
    private adminCurrentPageService: AdminCurrentPageService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.adminCurrentPageService.setRouteSubscription();
    this.currentPage$ = this.adminCurrentPageService.currentPage$;
    this.navigationPage$ = this.adminCurrentPageService.navigationPage$;
    this.user$ = this.userService.getCurrentUser$().pipe(filter(isNonNull));
    this.apiUrl = API_URL;
  }

  ngOnDestroy(): void {
    this.adminCurrentPageService.unsetRouteSubscription();
  }

  public hasSeasonAccess(user: UserInterface): boolean {
    return checkUserRoles(user, [UserRole.ADMIN]);
  }

  public hasNewsAccess(user: UserInterface): boolean {
    return checkUserRoles(user, [UserRole.NEWSMAKER]);
  }

  public hasCupsAccess(user: UserInterface): boolean {
    return checkUserRoles(user, [UserRole.CUP_ORGANIZER]);
  }
}
