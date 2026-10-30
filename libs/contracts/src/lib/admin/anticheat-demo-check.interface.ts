import { AnticheatDemoCheckStatus } from './anticheat-demo-check-status.enum';
import { AnticheatDemoDisplayInterface } from './anticheat-demo-display.interface';

export interface AnticheatDemoCheckInterface {
  status: AnticheatDemoCheckStatus;
  display?: AnticheatDemoDisplayInterface;
}
