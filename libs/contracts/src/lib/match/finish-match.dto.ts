import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class FinishMatchDto {
  @IsNumber()
  @Transform(transformNumber)
  firstPlayerId: number;

  @IsNumber()
  @Transform(transformNumber)
  secondPlayerId: number;
}
