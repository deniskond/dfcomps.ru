import { Trajectory } from './trajectory';

export class EntityState {
  number: number = 0;
  eType: number = 0;
  eFlags: number = 0;
  pos: Trajectory = new Trajectory();
  apos: Trajectory = new Trajectory();
  time: number = 0;
  time2: number = 0;
  origin: number[] = [0, 0, 0];
  origin2: number[] = [0, 0, 0];
  angles: number[] = [0, 0, 0];
  angles2: number[] = [0, 0, 0];
  otherEntityNum: number = 0;
  otherEntityNum2: number = 0;
  groundEntityNum: number = 0;
  constantLight: number = 0;
  loopSound: number = 0;
  modelindex: number = 0;
  modelindex2: number = 0;
  clientNum: number = 0;
  frame: number = 0;
  solid: number = 0;
  events: number = 0;
  eventParm: number = 0;
  powerups: number = 0;
  weapon: number = 0;
  legsAnim: number = 0;
  torsoAnim: number = 0;
  generic1: number = 0;

  copy(other: EntityState): void {
    this.number = other.number;
    this.eType = other.eType;
    this.eFlags = other.eFlags;
    this.pos.copy(other.pos);
    this.apos.copy(other.apos);
    this.time = other.time;
    this.time2 = other.time2;
    this.origin = [...other.origin];
    this.origin2 = [...other.origin2];
    this.angles = [...other.angles];
    this.angles2 = [...other.angles2];
    this.otherEntityNum = other.otherEntityNum;
    this.otherEntityNum2 = other.otherEntityNum2;
    this.groundEntityNum = other.groundEntityNum;
    this.constantLight = other.constantLight;
    this.loopSound = other.loopSound;
    this.modelindex = other.modelindex;
    this.modelindex2 = other.modelindex2;
    this.clientNum = other.clientNum;
    this.frame = other.frame;
    this.solid = other.solid;
    this.events = other.events;
    this.eventParm = other.eventParm;
    this.powerups = other.powerups;
    this.weapon = other.weapon;
    this.legsAnim = other.legsAnim;
    this.torsoAnim = other.torsoAnim;
    this.generic1 = other.generic1;
  }
}
