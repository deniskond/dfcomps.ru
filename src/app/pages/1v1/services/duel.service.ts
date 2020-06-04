import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DuelService {
    private webSocket: WebSocket;
    private isWebSocketOpened$ = new BehaviorSubject<boolean>(false);

    public openConnection(): void {
        // TODO [1v1] Заменить урл
        this.webSocket = new WebSocket('ws://localhost:3000/1v1');
        this.webSocket.onopen = () => this.isWebSocketOpened$.next(true);
        this.webSocket.onmessage = (event: MessageEvent) => this.onMessage(event);
    }

    private onMessage(event: MessageEvent): void {}
}
