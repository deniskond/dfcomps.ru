import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CupRegistrationDto {
  @IsNumber()
  @Transform(transformNumber)
  cupId: number;
}
