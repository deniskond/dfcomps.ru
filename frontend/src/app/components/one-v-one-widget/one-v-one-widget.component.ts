import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Physics } from '../../enums/physics.enum';
import { UserInterface } from '../../interfaces/user.interface';
import { DuelService } from '../../pages/1v1/services/duel.service';
import { DuelWebsocketServerActions } from '../../pages/1v1/services/enums/duel-websocket-server-actions.enum';
import { MatchStates } from '../../pages/1v1/services/enums/match-states.enum';
import { QueueInfoInterface } from '../../pages/1v1/services/interfaces/queue-info.interface';
import { MatchFinishedService } from '../../pages/1v1/services/match-finsihed.service';
import { DuelServerMessageType } from '../../pages/1v1/services/types/duel-server-message.type';
import { LanguageService } from '../../services/language/language.service';
import { UserService } from '../../services/user-service/user.service';

@Component({
    selector: 'app-one-v-one-widget',
    templateUrl: './one-v-one-widget.component.html',
    styleUrls: ['./one-v-one-widget.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneVOneWidgetComponent implements OnInit {
    public matchState: MatchStates;
    public isWaitingForServerAnswer = false;
    public matchStates = MatchStates;
    public user$: Observable<UserInterface>;
    public queueInfo: QueueInfoInterface;
    public physics = Physics;

    private onDestroy$ = new Subject<void>();

    ngOnInit(): void {
        this.user$ = this.userService.getCurrentUser$();
        this.initServerMessagesSubscription();
        this.sendRestorePlayerStateMessageSubscription();
        this.initMatchFinishedSubscription();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    constructor(
        private duelService: DuelService,
        private changeDetectorRef: ChangeDetectorRef,
        private snackBar: MatSnackBar,
        private languageService: LanguageService,
        private userService: UserService,
        private router: Router,
        private matchFinishedService: MatchFinishedService,
    ) {}

    public joinQueue(physics: Physics): void {
        this.router.navigate(['/1v1'], { queryParams: { physics } });
    }

    private initMatchFinishedSubscription(): void {
        this.matchFinishedService.matchFinished$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
            this.matchState = MatchStates.WAITING_FOR_QUEUE;
            this.changeDetectorRef.markForCheck();
        });
    }

    private initServerMessagesSubscription(): void {
        this.duelService.serverMessages$.pipe(takeUntil(this.onDestroy$)).subscribe((serverMessage: DuelServerMessageType) => {
            this.isWaitingForServerAnswer = false;

            if (serverMessage.action === DuelWebsocketServerActions.PLAYER_STATE) {
                this.matchState = serverMessage.payload.state;
            }

            if (serverMessage.action === DuelWebsocketServerActions.QUEUE_INFO) {
                this.queueInfo = serverMessage.payload;
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
            }

            if (serverMessage.action === DuelWebsocketServerActions.MATCH_FINISHED) {
                this.matchState = MatchStates.MATCH_FINISHED;
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

    private sendRestorePlayerStateMessageSubscription(): void {
        this.user$.pipe(filter(Boolean), takeUntil(this.onDestroy$)).subscribe(({ id }: UserInterface) => this.duelService.sendRestoreStateMessage(id));
    }
}
