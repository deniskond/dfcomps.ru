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
