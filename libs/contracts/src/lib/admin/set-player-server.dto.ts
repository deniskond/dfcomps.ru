import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SetPlayerServerDto {
  @IsNumber()
  @Transform(transformNumber)
  userId: number;

  @IsNumber()
  @Transform(transformNumber)
  onlineCupId: number;

  @IsNumber()
  @Transform(transformNumber)
  serverNumber: number;
}
