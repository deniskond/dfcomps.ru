import { DemoUploadResult } from '../enums/demo-upload-result.enum';

export interface UploadDemoDtoInterface {
    status: DemoUploadResult;
    errors?: Record<string, string>;
    warnings?: string[];
    message?: string;
}
