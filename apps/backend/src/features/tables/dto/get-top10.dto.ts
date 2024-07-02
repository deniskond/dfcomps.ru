import { Physics, RatingTablesModes } from '@dfcomps/contracts';
import { IsEnum } from 'class-validator';

export class GetTop10Dto {
  @IsEnum(Physics)
  physics: Physics;

  @IsEnum(RatingTablesModes)
  mode: RatingTablesModes;
}
