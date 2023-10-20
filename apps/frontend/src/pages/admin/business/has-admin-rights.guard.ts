import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { filter, map, Observable, tap } from 'rxjs';
import { isNonNull } from '../../../shared/helpers';
import { UserService } from '~shared/services/user-service/user.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { checkIfSuperadmin } from '@dfcomps/auth';

@Injectable()
export class HasAdminRights {
  constructor(
    private router: Router,
    private userService: UserService,
  ) {}

  canActivate(): Observable<boolean> {
    return this.userService.getCurrentUser$().pipe(
      filter(isNonNull),
      map((user: UserInterface) => checkIfSuperadmin(user.roles)),
      tap((hasAccess: boolean) => {
        if (!hasAccess) {
          this.router.navigate(['/']);
        }
      }),
    );
  }
}
