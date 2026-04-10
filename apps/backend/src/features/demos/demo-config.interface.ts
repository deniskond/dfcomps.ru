import { Physics } from '@dfcomps/contracts';

export interface DemoConfigInterface {
  defragGameType: string;
  rawDemoInfo: string;
  serverFPS: string;
  handicap: string;
  g_synchronousClients: string;
  mapName: string;
  defragVersion: string;
  physic: Physics;
  g_gravity: string;
  g_knockback: string;
  g_speed: string;
  pmove_msec: string;
  sv_cheats: string;
  timescale: string;
  areOBsEnabled: string;
  pmove_fixed: string;
  maxSpeed?: string;
  time?: string;
  isTimeReset?: boolean;
}
