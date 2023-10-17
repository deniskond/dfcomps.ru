import { ValidationErrorInterface } from '@dfcomps/contracts';

export interface DemoCheckResultInterface {
  valid: boolean;
  errors: Record<string, ValidationErrorInterface>;
  warnings: string[];
}
