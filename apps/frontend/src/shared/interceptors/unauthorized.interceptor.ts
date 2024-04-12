import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { UserService } from '~shared/services/user-service/user.service';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpEvent<any>) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.userService.logout();
          this.router.navigate(['/']);
        }

        return of(error);
      }),
    );
  }
}
