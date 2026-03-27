import { Physics } from '@dfcomps/contracts';

export interface ClientEventResult {
  time: number;
  timeHasError: boolean;
  serverTime: number;
  playerNum: number;
  playerMode: number;
  speed: number;
  eventStartFile: boolean;
  eventStartTime: boolean;
  eventTimeReset: boolean;
  eventFinish: boolean;
  eventCheckPoint: boolean;
  eventSomeTrigger: boolean;
  eventChangePmType: boolean;
  eventChangeUser: boolean;
}

export interface DemoConfigInterface {
  client: {
    defrag_gametype: string;
    mapname: string;
    defrag_vers: string;
  };
  raw: {
    '544': string;
  };
  game: {
    defrag_svfps: string;
    g_gravity: string;
    g_knockback: string;
    g_speed: string;
    pmove_msec: string;
    sv_cheats: string;
    timescale: string;
    defrag_obs: string;
    g_synchronousClients: string;
    pmove_fixed: string;
  };
  player: {
    hc: string;
  };
  physic: Physics;

  // New fields populated by full snapshot parsing
  clientEvents?: ClientEventResult[];
  isCpmInParams?: boolean | null;
  isCpmInSnapshots?: boolean | null;
  isCheatsOn?: boolean;
  isOnline?: boolean;
  maxSpeed?: number;
  dfvers?: number;
}
