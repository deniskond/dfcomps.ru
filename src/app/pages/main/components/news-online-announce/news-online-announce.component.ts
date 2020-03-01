import { UserInterface } from '../../../../interfaces/user.interface';
import { UserService } from '../../../../services/user-service/user.service';
import { RegisteredPlayerInterface } from '../../../../interfaces/registered-player.interface';
import { LanguageService } from '../../../../services/language/language.service';
import { Translations } from '../../../../components/translations/translations.component';
import { NewsOnlineAnnounceInterface } from '../../../../services/news-service/interfaces/news-online-announce.interface';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { range } from 'lodash';
import { CupRegistrationService } from '../../services/cup-registration/cup-registration.service';
import { filter, withLatestFrom, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
    selector: 'app-news-online-announce',
    templateUrl: './news-online-announce.component.html',
    styleUrls: ['./news-online-announce.component.less'],
})
export class NewsOnlineAnnounceComponent extends Translations implements OnChanges {
    @Input() news: NewsOnlineAnnounceInterface;

    public range = range;
    public columnCount = 4;
    public rowCount = 10;
    public isRegistered: boolean;
    public registeredPlayers: RegisteredPlayerInterface[];

    constructor(
        protected languageService: LanguageService,
        private cupRegistrationService: CupRegistrationService,
        private userService: UserService,
        private snackBar: MatSnackBar,
    ) {
        super(languageService);
    }

    ngOnChanges({ news }: SimpleChanges): void {
        if (news && news.currentValue) {
            this.isRegistered = this.news.isRegistered;
            this.registeredPlayers = this.news.registeredPlayers;
        }
    }

    public toggleRegistration(): void {
        if (this.isRegistered) {
            this.cupRegistrationService
                .cancelRegistrationForCup$(this.news.cupId)
                .pipe(
                    withLatestFrom(this.userService.getCurrentUser$()),
                    filter(([, user]: [void, UserInterface]) => !!user),
                )
                .subscribe(([, user]: [void, UserInterface]) => {
                    this.isRegistered = false;
                    this.registeredPlayers = this.registeredPlayers.filter(
                        ({ id }: RegisteredPlayerInterface) => id !== user.id,
                    );
                });
        } else {
            this.cupRegistrationService
                .registerForCup$(this.news.cupId)
                .pipe(
                    withLatestFrom(this.userService.getCurrentUser$()),
                    filter(([, user]: [void, UserInterface]) => !!user),
                )
                .subscribe(([, { country, id, nick }]: [void, UserInterface]) => {
                    this.isRegistered = true;
                    this.registeredPlayers = [
                        ...this.registeredPlayers,
                        {
                            country,
                            id,
                            nick,
                        },
                    ];
                });
        }
    }
}
