import * as WebSocket from 'ws';

export interface ClientInterface {
  uniqueId: string;
  playerId: string;
  socket: WebSocket;
}
