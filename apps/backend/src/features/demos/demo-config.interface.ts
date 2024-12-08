import { Physics } from '@dfcomps/contracts';

export interface DemoConfigInterface {
  client: {
    defrag_gametype: string;
    mapname: string;
    defrag_vers: string;
    df_promode: '0' | '1';
  };
  raw: Record<number, string>;
  game: {
    defrag_svfps: string;
    g_gravity: string;
    g_knockback: string;
    g_speed: string;
    pmove_msec: string;
    sv_cheats: string;
    timescale: string;
    defrag_obs: string;
    g_synchronousclients: string;
    pmove_fixed: string;
  };
  player: {
    hc: string;
  } | null;
  physic: Physics;
}
