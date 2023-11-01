import { Physics } from '@dfcomps/contracts';

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
  };
  player: {
    hc: string;
  };
  physic: Physics;
}
