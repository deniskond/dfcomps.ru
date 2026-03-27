import { ClientConnection } from './client-connection';
import { ClientState } from './client-state';

export class RawInfo {
  filename: string;
  clc: ClientConnection;
  client: ClientState;

  constructor(filename: string, clc: ClientConnection, client: ClientState) {
    this.filename = filename;
    this.clc = clc;
    this.client = client;
  }
}
