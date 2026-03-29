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

  // Human-readable summary sections (equivalent to RawInfo.getFriendlyInfo())
  record?: DemoRecordSection;
  timer?: DemoTimerSection;
}

// Index signatures are required for "time N" and "CheckPoint N" dynamic keys.
// All named fields must be `string | undefined` to be compatible with the index signature.

export interface DemoRecordSection {
  demoname: string;
  /** Raw console line: `print "Date: MM-dd-yy HH:mm\n"` */
  date?: string;
  /** Raw console time line when there is exactly one match */
  time?: string;
  /** Finish time formatted as `mm.ss.ms`, suffixed with ` (Time reset)` for TR runs */
  bestTime?: string;
  maxSpeed?: string;
  /** Present with value `"true"` when the file-start client differs from the timer-start player */
  spectatorRecorded?: string;
  /** `"<N> sec (ServerTime: mm.ss.ms)"` when timer start is >20 s after file start */
  lateStart?: string;
  /** Catches dynamic `"time 1"`, `"time 2"` … keys when multiple console time lines are found */
  [key: string]: string | undefined;
}

export interface DemoTimerSection {
  /** Raw `TimerStopped …` console command */
  Source: string;
  /** Total finish time formatted as `mm.ss.ms`, optionally suffixed with segment diff */
  FinishTimer?: string;
  /** Present with value `"true"` for time-reset runs */
  timereset?: string;
  pmove_fixed?: string;
  sv_fps?: string;
  com_maxfps?: string;
  g_sync?: string;
  pmove_msec?: string;
  all_weapons?: string;
  no_damage?: string;
  enable_powerups?: string;
  /** Catches dynamic `"CheckPoint"`, `"CheckPoint 2"` … keys */
  [key: string]: string | undefined;
}
