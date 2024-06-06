import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { filter, take } from 'rxjs';
import { isNonNull } from '~shared/helpers';
import { UserInterface } from '~shared/interfaces/user.interface';
import { UserService } from '~shared/services/user-service/user.service';

@Component({
  templateUrl: './admin-redirect.component.html',
  styleUrls: ['./admin-redirect.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRedirectComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userService
      .getCurrentUser$()
      .pipe(filter(isNonNull), take(1))
      .subscribe((user: UserInterface) => {
        if (checkUserRoles(user.roles, [UserRoles.NEWSMAKER])) {
          this.router.navigate(['/admin/news']);
        } else if (checkUserRoles(user.roles, [UserRoles.VALIDATOR, UserRoles.CUP_ORGANIZER])) {
          this.router.navigate(['/admin/cups']);
        } else if (checkUserRoles(user.roles, [UserRoles.WARCUP_ADMIN])) {
          this.router.navigate(['/admin/warcup-selection']);
        }
      });
  }
}
