import { CLSnapshot } from './cl-snapshot';

export class ClientEvent {
  eventStartFile: boolean = false;
  eventStartTime: boolean = false;
  eventTimeReset: boolean = false;
  eventFinish: boolean = false;
  eventCheckPoint: boolean = false;
  eventSomeTrigger: boolean = false;
  eventChangePmType: boolean = false;
  eventChangeUser: boolean = false;

  time: number = 0;
  timeHasError: boolean = false;
  timeByServerTime: number = 0;
  serverTime: number = 0;
  playerNum: number = 0;
  playerMode: number = 0;
  userStat: number = 0;
  speed: number = 0;

  get hasAnyEvent(): boolean {
    return (
      this.eventStartFile ||
      this.eventStartTime ||
      this.eventTimeReset ||
      this.eventFinish ||
      this.eventCheckPoint ||
      this.eventChangePmType ||
      this.eventChangeUser ||
      this.eventSomeTrigger
    );
  }

  get timeNoError(): number {
    return this.timeHasError ? this.timeByServerTime : this.time;
  }

  constructor(time: number, timeHasError: boolean, snapshot: CLSnapshot) {
    if (!timeHasError) {
      this.time = time;
    }
    this.timeHasError = timeHasError;
    this.serverTime = snapshot.serverTime;
    this.playerNum = snapshot.ps.clientNum;
    this.userStat = snapshot.ps.stats[12];
    this.playerMode = snapshot.ps.pm_type;
  }

  static readonly PlayerMode = {
    PM_NORMAL: 0,
    PM_NOCLIP: 1,
    PM_SPECTATOR: 2,
    PM_DEAD: 3,
  };
}
