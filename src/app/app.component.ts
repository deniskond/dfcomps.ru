import { LoginResultDtoInterface } from './services/user-service/dto/login-result.dto';
import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user-service/user.service';
import { take, filter } from 'rxjs/operators';
import { LanguageService } from './services/language/language.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
    constructor(private userService: UserService, private languageService: LanguageService) {}

    ngOnInit(): void {
        this.tryLoginFromCookie();
        this.setLanguageFromCookie();
    }

    private tryLoginFromCookie(): void {
        this.userService
            .tryLoginFromCookie$()
            .pipe(
                take(1),
                filter(({ logged }: LoginResultDtoInterface) => logged),
            )
            .subscribe(({ user }: LoginResultDtoInterface) => this.userService.setCurrentUser(user));
    }

    private setLanguageFromCookie(): void {
        this.languageService.setLanguageFromCookie();
    }
}
