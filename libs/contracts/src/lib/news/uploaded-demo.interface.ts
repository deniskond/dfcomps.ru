import { Physics } from '../global/physics.enum';

export interface UploadedDemoInterface {
  demopath: string;
  physics: Physics;
  time: number;
}
