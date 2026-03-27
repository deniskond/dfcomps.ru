import { TrajectoryType } from './trajectory-type';

export class Trajectory {
  trType: TrajectoryType = TrajectoryType.STATIONARY;
  trTime: number = 0;
  trDuration: number = 0;
  trBase: number[] = [0, 0, 0];
  trDelta: number[] = [0, 0, 0];

  copy(other: Trajectory): void {
    this.trType = other.trType;
    this.trTime = other.trTime;
    this.trDuration = other.trDuration;
    this.trBase = [...other.trBase];
    this.trDelta = [...other.trDelta];
  }
}
