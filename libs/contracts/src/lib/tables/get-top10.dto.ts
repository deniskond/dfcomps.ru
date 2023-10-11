import { IsNotEmpty } from 'class-validator';
import { RatingTablesModes } from './rating-tables-modes.enum';
import { Physics } from '../global/physics.enum';

export class GetTop10Dto {
  @IsNotEmpty()
  physics: Physics;

  @IsNotEmpty()
  mode: RatingTablesModes;
}
