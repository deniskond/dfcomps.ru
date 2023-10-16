import { DemoUploadResult } from './demo-upload-result.enum';

export interface UploadDemoResponseInterface {
  status: DemoUploadResult;
  errors?: Record<string, string>;
  warnings?: string[];
  message?: string;
}
