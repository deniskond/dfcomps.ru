import { IsEnum, IsNumber } from 'class-validator';
import { Physics } from '../global/physics.enum';
import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';

export class UpdateBotTimeDto {
  @IsNumber()
  @Transform(transformNumber)
  firstPlayerId: number;

  @IsNumber()
  @Transform(transformNumber)
  secondPlayerId: number;

  @IsEnum(Physics)
  physics: Physics;

  @IsNumber()
  @Transform(transformNumber)
  wr: number;
}
