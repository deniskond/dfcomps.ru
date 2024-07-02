import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DemoDeleteDto {
  @IsNumber()
  @Transform(transformNumber)
  cupId: number;

  @IsNotEmpty()
  demoName: string;
}
