import { InvalidDemoInterface } from './invalid-demo.interface';
import { ValidDemoInterface } from './valid-demo.interface';

export interface ResultsTableInterface {
  valid: ValidDemoInterface[];
  invalid: InvalidDemoInterface[];
}
