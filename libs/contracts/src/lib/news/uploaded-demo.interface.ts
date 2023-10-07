import { Physics } from '../physics.enum';

export interface UploadedDemoInterface {
  demopath: string;
  physics: Physics;
  time: number;
}
