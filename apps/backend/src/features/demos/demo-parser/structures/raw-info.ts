import { ClientConnection } from './client-connection';
import { ClientState } from './client-state';

export class RawInfo {
  clc: ClientConnection;
  client: ClientState;

  constructor(clc: ClientConnection, client: ClientState) {
    this.clc = clc;
    this.client = client;
  }
}
