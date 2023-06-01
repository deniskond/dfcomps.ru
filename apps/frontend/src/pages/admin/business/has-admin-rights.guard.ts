import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { filter, map, Observable, tap } from 'rxjs';
import { isNonNull } from '../../../shared/helpers';
import { UserService } from '~shared/services/user-service/user.service';
import { UserInterface } from '~shared/interfaces/user.interface';
import { UserAccess } from '~shared/enums/user-access.enum';

@Injectable()
export class HasAdminRights implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(): Observable<boolean> {
    return this.userService.getCurrentUser$().pipe(
      filter(isNonNull),
      map((user: UserInterface) => user.access === UserAccess.ADMIN),
      tap((hasAccess: boolean) => {
        if (!hasAccess) {
          this.router.navigate(['/']);
        }
      }),
    );
  }
}
