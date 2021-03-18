import { LanguageService } from './../../services/language/language.service';
import { DuelServerMessageType } from './services/types/duel-server-message.type';
import { UserInterface } from './../../interfaces/user.interface';
import { UserService } from './../../services/user-service/user.service';
import { Physics } from './../../enums/physics.enum';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DuelService } from './services/duel.service';
import { take, filter, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { DuelWebsocketServerActions } from './services/enums/duel-websocket-server-actions.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatchStates } from './services/enums/match-states.enum';
import { MatchInterface } from './services/interfaces/match.interface';
import { DuelPlayersInfoInterface } from './interfaces/duel-players-info.interface';
import { PickbanPhases } from './enums/pickban-phases.enum';
import { isEqual } from 'lodash';

@Component({
    templateUrl: './1v1.page.html',
    styleUrls: ['./1v1.page.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneVOnePageComponent implements OnInit, OnDestroy {
    public matchState: MatchStates;
    public matchStates = MatchStates;
    public physics = Physics;
    public selectedPhysics: Physics;
    public user$: Observable<UserInterface>;
    public isWaitingForServerAnswer = false;
    public match: MatchInterface;
    public playersInfo: DuelPlayersInfoInterface | null = null;
    public pickbanPhases = PickbanPhases;

    private onDestroy$ = new Subject<void>();

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private duelService: DuelService,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private languageService: LanguageService,
    ) {}

    ngOnInit(): void {
        this.user$ = this.userService.getCurrentUser$();
        this.initUserSubscriptions();
        this.sendRestorePlayerStateMessage();
        this.initServerMessagesSubscription();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
        this.duelService.closeConnection();
    }

    public joinQueue(physics: Physics): void {
        this.isWaitingForServerAnswer = true;
        this.selectedPhysics = physics;

        this.user$.pipe(filter(Boolean), take(1)).subscribe(({ id }: UserInterface) => this.duelService.joinQueue(id, physics));
    }

    public leaveQueue(): void {
        this.user$.pipe(filter(Boolean), take(1)).subscribe(({ id }: UserInterface) => this.duelService.leaveQueue(id));
    }

    public onMapBanned(mapName: string): void {
        this.user$.pipe(filter(Boolean), take(1)).subscribe(({ id }: UserInterface) => this.duelService.banMap(id, mapName));
    }

    public acceptResult(): void {
        this.user$.pipe(filter(Boolean), take(1)).subscribe(({ id }: UserInterface) => {
            this.duelService.acceptResult(id);
            this.matchState = MatchStates.WAITING_FOR_QUEUE;
            this.playersInfo = null;
        });
    }

    public getDemoLink(demoName: string, matchId: string): string {
        return `/api/uploads/demos/matches/match${matchId}/${demoName}`;
    }

    public getMatchResult(playersInfo: DuelPlayersInfoInterface): string {
        if (!playersInfo) {
            return '';
        }

        const firstPlayerTime = parseFloat(playersInfo.firstPlayerTime) || 10000;
        const secondPlayerTime = parseFloat(playersInfo.secondPlayerTime) || 10000;

        if (firstPlayerTime === secondPlayerTime) {
            return 'draw';
        }

        return 'wins';
    }

    // TODO Поправить дублирование кода
    public getMatchWinner(playersInfo: DuelPlayersInfoInterface): string {
        if (!playersInfo) {
            return '';
        }

        const firstPlayerTime = parseFloat(playersInfo.firstPlayerTime) || 10000;
        const secondPlayerTime = parseFloat(playersInfo.secondPlayerTime) || 10000;

        if (firstPlayerTime === secondPlayerTime) {
            return '';
        }

        return firstPlayerTime < secondPlayerTime ? playersInfo.firstPlayerInfo.nick : playersInfo.secondPlayerInfo.nick;
    }

    private initUserSubscriptions(): void {
        this.user$.pipe(distinctUntilChanged(isEqual), takeUntil(this.onDestroy$)).subscribe((user: UserInterface) => {
            if (user) {
                this.duelService.openConnection();
                this.setPlayersInfo();
                return;
            }

            this.duelService.closeConnection();
        });
    }

    private initServerMessagesSubscription(): void {
        this.duelService.serverMessages$.pipe(takeUntil(this.onDestroy$)).subscribe((serverMessage: DuelServerMessageType) => {
            this.isWaitingForServerAnswer = false;

            if (serverMessage.action === DuelWebsocketServerActions.PLAYER_STATE) {
                this.restoreState(serverMessage.payload);
            }

            if (serverMessage.action === DuelWebsocketServerActions.JOIN_QUEUE_SUCCESS) {
                if (this.matchState === MatchStates.WAITING_FOR_QUEUE) {
                    this.matchState = MatchStates.IN_QUEUE;
                }
            }

            if (serverMessage.action === DuelWebsocketServerActions.JOIN_QUEUE_FAILURE) {
                this.showErrorNotification(serverMessage.payload.error);
            }

            if (serverMessage.action === DuelWebsocketServerActions.LEAVE_QUEUE_SUCCESS) {
                if (this.matchState === MatchStates.IN_QUEUE) {
                    this.matchState = MatchStates.WAITING_FOR_QUEUE;
                }
            }

            if (serverMessage.action === DuelWebsocketServerActions.PICKBAN_STEP) {
                this.matchState = MatchStates.MATCH_IN_PROGRESS;
                this.match = serverMessage.payload.match;

                this.setPlayersInfo();
            }

            if (serverMessage.action === DuelWebsocketServerActions.MATCH_FINISHED) {
                this.matchState = MatchStates.MATCH_FINISHED;

                this.setPlayersInfo(false);
            }

            if (serverMessage.action === DuelWebsocketServerActions.DUPLICATE_CLIENT) {
                this.matchState = MatchStates.DUPLICATE_CLIENT;
                this.duelService.closeConnection();
            }

            this.changeDetectorRef.markForCheck();
        });
    }

    private showErrorNotification(errorMessage: string): void {
        this.languageService
            .getTranslations$()
            .pipe(take(1))
            .subscribe((translations: Record<string, string>) => this.snackBar.open(translations.error, errorMessage, { duration: 3000 }));
    }

    private sendRestorePlayerStateMessage(): void {
        this.user$.pipe(filter(Boolean), take(1)).subscribe(({ id }: UserInterface) => this.duelService.sendRestoreStateMessage(id));
    }

    private restoreState({ state, physics, match }: { state: MatchStates; physics?: Physics; match?: MatchInterface }): void {
        this.matchState = state;

        if (state === MatchStates.MATCH_IN_PROGRESS) {
            this.setPlayersInfo();
        }

        if (state === MatchStates.MATCH_FINISHED) {
            this.setPlayersInfo(false);
        }

        if (physics) {
            this.selectedPhysics = physics;
        }

        if (match) {
            this.match = match;
        }
    }

    private setPlayersInfo(useCache = true): void {
        if (useCache && this.playersInfo) {
            return;
        }

        this.user$.pipe(filter(Boolean), take(1)).subscribe(() =>
            this.duelService.getPlayersInfo$().subscribe((playersInfo) => {
                this.playersInfo = playersInfo;
                this.changeDetectorRef.detectChanges();
            }),
        );
    }
}
