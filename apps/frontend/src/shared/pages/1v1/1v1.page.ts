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
import { MatchInterface } from './services/interfaces/match.interface';
import { DuelPlayersInfoInterface } from './interfaces/duel-players-info.interface';
import { PickbanPhases } from './enums/pickban-phases.enum';
import { MatchFinishedService } from './services/match-finsihed.service';
import { JoinQueueService } from './services/join-queue.service';
import { Languages } from '../../enums/languages.enum';

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
  public user$: Observable<UserInterface | null>;
  public isWaitingForServerAnswer = false;
  public match: MatchInterface;
  public playersInfo: DuelPlayersInfoInterface | null = null;
  public pickbanPhases = PickbanPhases;
  public language$: Observable<Languages> = this.languageService.getLanguage$();
  public languages = Languages;

  private onDestroy$ = new Subject<void>();
  private isBrowserTabVisible$ = new Subject<boolean>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private duelService: DuelService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private languageService: LanguageService,
    private matchFinishedService: MatchFinishedService,
    private joinQueueService: JoinQueueService,
  ) {
    document.addEventListener('visibilitychange', () => this.isBrowserTabVisible$.next(!document.hidden));
  }

  ngOnInit(): void {
    this.user$ = this.userService.getCurrentUser$();
    this.sendRestorePlayerStateMessage();
    this.initServerMessagesSubscription();
    this.initJoinQueueCheck();

    this.isBrowserTabVisible$.pipe(filter(Boolean)).subscribe(() => this.sendRestorePlayerStateMessage());
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public joinQueue(physics: Physics): void {
    this.isWaitingForServerAnswer = true;
    this.selectedPhysics = physics;
    this.playersInfo = null;

    this.user$
      .pipe(filter(Boolean), take(1))
      .subscribe(({ id }: UserInterface) => this.duelService.joinQueue(id, physics));
  }

  public leaveQueue(): void {
    this.user$.pipe(filter(Boolean), take(1)).subscribe(({ id }: UserInterface) => this.duelService.leaveQueue(id));
  }

  public onMapBanned(mapName: string): void {
    this.user$
      .pipe(filter(Boolean), take(1))
      .subscribe(({ id }: UserInterface) => this.duelService.banMap(id, mapName));
  }

  public acceptResult(): void {
    this.user$.pipe(filter(Boolean), take(1)).subscribe(({ id }: UserInterface) => {
      this.duelService.acceptResult(id);
      this.matchState = MatchStates.WAITING_FOR_QUEUE;
      this.playersInfo = null;
      this.matchFinishedService.onMatchFinished();
    });
  }

  public getDemoLink(demoName: string, matchId: string): string {
    return `/api/uploads/demos/matches/match${matchId}/${demoName}`;
  }

  public getMatchResult(playersInfo: DuelPlayersInfoInterface): string {
    if (!playersInfo) {
      return '';
    }

    const firstPlayerTime = parseFloat(playersInfo.firstPlayerTime!) || 10000;
    const secondPlayerTime = parseFloat(playersInfo.secondPlayerTime!) || 10000;

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

    const firstPlayerTime = parseFloat(playersInfo.firstPlayerTime!) || 10000;
    const secondPlayerTime = parseFloat(playersInfo.secondPlayerTime!) || 10000;

    if (firstPlayerTime === secondPlayerTime) {
      return '';
    }

    const firstPlayerNick = playersInfo.firstPlayerId === '-1' ? 'dfcomps bot' : playersInfo.firstPlayerInfo?.nick;
    const secondPlayerNick = playersInfo.secondPlayerId === '-1' ? 'dfcomps bot' : playersInfo.secondPlayerInfo?.nick;

    return firstPlayerTime < secondPlayerTime ? firstPlayerNick : secondPlayerNick;
  }

  private initJoinQueueCheck(): void {
    if (this.joinQueueService.queue !== null) {
      this.joinQueue(this.joinQueueService.queue);
      this.joinQueueService.setJoinQueue(null);
    }
  }

  private initServerMessagesSubscription(): void {
    this.duelService.serverMessages$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((serverMessage: DuelServerMessageType) => {
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
      .subscribe((translations: Record<string, string>) =>
        this.snackBar.open(translations['error'], errorMessage, { duration: 3000 }),
      );
  }

  private sendRestorePlayerStateMessage(): void {
    this.user$
      .pipe(filter(Boolean), take(1))
      .subscribe(({ id }: UserInterface) => this.duelService.sendRestoreStateMessage(id));
  }

  private restoreState({
    state,
    physics,
    match,
  }: {
    state: MatchStates;
    physics?: Physics;
    match?: MatchInterface;
  }): void {
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
      this.duelService.getPlayersInfo$().subscribe((playersInfo: DuelPlayersInfoInterface) => {
        this.playersInfo = playersInfo;
        this.changeDetectorRef.detectChanges();
      }),
    );
  }
}
