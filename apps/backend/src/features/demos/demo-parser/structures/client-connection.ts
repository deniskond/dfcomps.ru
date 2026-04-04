import { EntityState } from './entity-state';

export class ClientConnection {
  serverMessageSequence: number = 0;
  configs: Record<number, string> = {};
  entityBaselines: Record<number, EntityState> = {};
  checksumFeed: number = 0;
  clientNum: number = 0;
  demowaiting: boolean = false;
  console: Record<number, { time: number; command: string }> = {};
  errors: Record<string, null> = {};
}
