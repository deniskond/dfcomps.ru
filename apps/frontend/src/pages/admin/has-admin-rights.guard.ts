import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { filter, map, Observable, tap } from 'rxjs';
import { UserAccess } from '../../app/enums/user-access.enum';
import { UserInterface } from '../../app/interfaces/user.interface';
import { UserService } from '../../app/services/user-service/user.service';
import { isNonNull } from '../../shared/helpers';

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
