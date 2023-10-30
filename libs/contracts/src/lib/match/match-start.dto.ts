import { IsEnum, IsNotEmpty } from 'class-validator';
import { Physics } from '../global/physics.enum';

export class MatchStartDto {
  @IsNotEmpty()
  firstPlayerId: number;

  @IsNotEmpty()
  secondPlayerId: number;

  @IsNotEmpty()
  @IsEnum(Physics)
  physics: Physics;
}
