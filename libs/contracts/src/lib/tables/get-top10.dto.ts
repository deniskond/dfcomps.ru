import { IsNotEmpty } from 'class-validator';
import { Physics } from '../physics.enum';
import { RatingTablesModes } from './rating-tables-modes.enum';

export class GetTop10Dto {
  @IsNotEmpty()
  physics: Physics;

  @IsNotEmpty()
  mode: RatingTablesModes;
}
