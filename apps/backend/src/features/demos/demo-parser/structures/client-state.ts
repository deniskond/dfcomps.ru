import { CLSnapshot } from './cl-snapshot';
import { ClientEvent } from './client-event';
import { EntityState } from './entity-state';

export class ClientState {
  snap: CLSnapshot = new CLSnapshot();
  newSnapshots: boolean = false;
  parseEntitiesNum: number = 0;
  snapshots: Record<number, CLSnapshot> = {};
  entityBaselines: Record<number, EntityState> = {};
  parseEntities: Record<number, EntityState> = {};
  clientEvents: ClientEvent[] = [];
  lastClientEvent: ClientEvent | null = null;
  clientConfig: Record<string, string> | null = null;
  gameConfig: Record<string, string> | null = null;
  mapname: string = '';
  mapNameChecksum: number = 0;
  dfvers: number = 0;
  isOnline: boolean = false;
  isCheatsOn: boolean = false;
  maxSpeed: number = 0;
  isCpmInParams: boolean | null = null;
  isCpmInSnapshots: boolean | null = null;
}
