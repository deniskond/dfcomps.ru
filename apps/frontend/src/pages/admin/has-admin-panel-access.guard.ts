import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, of, tap } from 'rxjs';
import { UserAccess } from '../../app/enums/user-access.enum';
import { UserInterface } from '../../app/interfaces/user.interface';
import { UserService } from '../../app/services/user-service/user.service';

@Injectable()
export class HasAdminPanelAccess implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(): Observable<boolean> {
    return this.userService.getCurrentUser$().pipe(
      map((user: UserInterface) => user.access === UserAccess.ADMIN || user.access === UserAccess.CUP_ORGANIZER),
      tap((hasAccess: boolean) => {
        if (!hasAccess) {
          this.router.navigate(['/']);
        }
      }),
    );
  }
}
