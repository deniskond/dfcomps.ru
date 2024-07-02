import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMatchInfoDto {
  @IsNumber()
  @Transform(transformNumber)
  firstPlayerId: number;

  @IsNumber()
  @Transform(transformNumber)
  secondPlayerId: number;

  @IsNotEmpty()
  map: string;
}
