import { Physics } from '../../../enums/physics.enum';
import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import { JoinQueueMessageInterface } from './interfaces/join-queue-message.interface';
import { filter, take } from 'rxjs/operators';
import { DuelWebsocketClientActions } from './enums/duel-websocket-client-actions.enum';
import { DuelClientMessage } from './types/duel-client-message.type';
import { DuelServerMessageType } from './types/duel-server-message.type';
import { LeaveQueueMessageInterface } from './interfaces/leave-queue-message.interface';

@Injectable({
    providedIn: 'root',
})
export class DuelService {
    private _serverMessages$ = new ReplaySubject<DuelServerMessageType>(1);
    private webSocket: WebSocket;
    private isWebSocketOpened$ = new BehaviorSubject<boolean>(false);

    public get serverMessages$(): Observable<DuelServerMessageType> {
        return this._serverMessages$.asObservable();
    }

    public openConnection(): void {
        // TODO [1v1] Заменить урл
        this.webSocket = new WebSocket('ws://localhost:3000/1v1');
        this.webSocket.onopen = () => this.isWebSocketOpened$.next(true);
        this.webSocket.onmessage = (event: MessageEvent) => this.onMessage(event);
    }

    public sendRestoreStateMessage(playerId: string): void {
        this.send({ playerId, action: DuelWebsocketClientActions.GET_PLAYER_STATE });
    }

    public joinQueue(playerId: string, physics: Physics): void {
        const joinQueueRequest: JoinQueueMessageInterface = {
            playerId,
            action: DuelWebsocketClientActions.JOIN_QUEUE,
            payload: {
                physics,
            },
        };

        this.send(joinQueueRequest);
    }

    public leaveQueue(playerId: string): void {
        const leaveQueueRequest: LeaveQueueMessageInterface = {
            playerId,
            action: DuelWebsocketClientActions.LEAVE_QUEUE,
        };

        this.send(leaveQueueRequest);
    }

    public closeConnection(): void {
        if (this.webSocket) {
            this.webSocket.close();
        }

        this.isWebSocketOpened$.next(false);
    }

    private onMessage(event: MessageEvent): void {
        const serverMessage: string = event.data;

        try {
            const parsedServerMessage: DuelServerMessageType = JSON.parse(serverMessage);

            this._serverMessages$.next(parsedServerMessage);
        } catch {}
    }

    private send(data: DuelClientMessage): void {
        this.isWebSocketOpened$.pipe(filter(Boolean), take(1)).subscribe(() => this.webSocket.send(JSON.stringify(data)));
    }
}
