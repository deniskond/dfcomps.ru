import { LoginResultDtoInterface } from './services/user-service/dto/login-result.dto';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './services/user-service/user.service';
import { take, filter, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LanguageService } from './services/language/language.service';
import { Observable, Subject } from 'rxjs';
import { UserInterface } from './interfaces/user.interface';
import { isEqual } from 'lodash';
import { DuelService } from './pages/1v1/services/duel.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, OnDestroy {
    public user$: Observable<UserInterface>;

    private onDestroy$ = new Subject<void>();

    constructor(private userService: UserService, private languageService: LanguageService, private duelService: DuelService) {}

    @HostListener('window:beforeunload', ['$event'])
    unloadHandler() {
        // this.duelService.closeConnection();
    }

    ngOnInit(): void {
        this.user$ = this.userService.getCurrentUser$();

        this.tryLoginFromCookie();
        this.setLanguageFromCookie();
        this.initUserSubscriptions();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        this.duelService.closeConnection();
    }

    private tryLoginFromCookie(): void {
        this.userService
            .tryLoginFromCookie$()
            .pipe(
                take(1),
                filter(({ logged }: LoginResultDtoInterface) => logged),
            )
            .subscribe(({ user }: LoginResultDtoInterface) => this.userService.setCurrentUser(user)); // TODO should be moved into userService
    }

    private setLanguageFromCookie(): void {
        this.languageService.setLanguageFromCookie();
    }

    private initUserSubscriptions(): void {
        this.user$.pipe(distinctUntilChanged(isEqual), takeUntil(this.onDestroy$)).subscribe((user: UserInterface) => {
            if (user) {
                this.duelService.openConnection();

                return;
            }

            this.duelService.closeConnection();
        });
    }
}
