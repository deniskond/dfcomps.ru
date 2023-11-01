import { DemoUploadResult } from './demo-upload-result.enum';
import { ValidationErrorInterface } from './validation-error.interface';

export interface UploadDemoResponseInterface {
  status: DemoUploadResult;
  errors?: Record<string, ValidationErrorInterface>;
  warnings?: string[];
  message?: string;
}
