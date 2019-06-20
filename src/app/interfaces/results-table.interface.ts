import { ValidDemoInterface } from './valid-demo.interface';
import { InvalidDemoInterface } from './invalid-demo.interface';

export interface ResultsTableInterface {
    valid: ValidDemoInterface[];
    invalid: InvalidDemoInterface[];
}
