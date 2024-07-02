import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DemoUploadDto {
  @IsNumber()
  @Transform(transformNumber)
  cupId: number;

  @IsNotEmpty()
  mapName: string;
}
