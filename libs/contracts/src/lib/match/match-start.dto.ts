import { IsEnum, IsNumber } from 'class-validator';
import { Physics } from '../global/physics.enum';
import { Transform } from 'class-transformer';
import { transformNumber } from '@dfcomps/helpers';

export class MatchStartDto {
  @IsNumber()
  @Transform(transformNumber)
  firstPlayerId: number;

  @IsNumber()
  @Transform(transformNumber)
  secondPlayerId: number;

  @IsEnum(Physics)
  physics: Physics;
}
