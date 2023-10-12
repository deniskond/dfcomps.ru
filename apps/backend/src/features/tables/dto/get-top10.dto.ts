import { Physics, RatingTablesModes } from '@dfcomps/contracts';
import { IsNotEmpty } from 'class-validator';

export class GetTop10Dto {
  @IsNotEmpty()
  physics: Physics;

  @IsNotEmpty()
  mode: RatingTablesModes;
}
