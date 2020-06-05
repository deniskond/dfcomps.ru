import { LanguageService } from './../../services/language/language.service';
import { DuelServerMessageType } from './services/types/duel-server-message.type';
import { UserInterface } from './../../interfaces/user.interface';
import { UserService } from './../../services/user-service/user.service';
import { Physics } from './../../enums/physics.enum';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DuelService } from './services/duel.service';
import { take, filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { DuelWebsocketServerActions } from './services/enums/duel-websocket-server-actions.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatchStates } from './services/enums/match-states.enum';

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

    private onDestroy$ = new Subject<void>();

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private duelService: DuelService,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private languageService: LanguageService,
    ) {}

    ngOnInit(): void {
        this.duelService.openConnection();
        this.user$ = this.userService.getCurrentUser$();
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

    private initServerMessagesSubscription(): void {
        this.duelService.serverMessages$.pipe(takeUntil(this.onDestroy$)).subscribe((serverMessage: DuelServerMessageType) => {
            this.isWaitingForServerAnswer = false;

            if (serverMessage.action === DuelWebsocketServerActions.PLAYER_STATE) {
                this.restoreState(serverMessage.payload);
            }

            if (serverMessage.action === DuelWebsocketServerActions.JOIN_QUEUE_SUCCESS) {
                this.matchState = MatchStates.IN_QUEUE;
            }

            if (serverMessage.action === DuelWebsocketServerActions.JOIN_QUEUE_FAILURE) {
                this.showErrorNotification(serverMessage.payload.error);
            }

            if (serverMessage.action === DuelWebsocketServerActions.LEAVE_QUEUE_SUCCESS) {
                this.matchState = MatchStates.WAITING_FOR_QUEUE;
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

    private restoreState({ state, physics }: { state: MatchStates; physics?: Physics }): void {
        this.matchState = state;

        if (state === MatchStates.IN_QUEUE) {
            this.selectedPhysics = physics;
        }
    }
}
