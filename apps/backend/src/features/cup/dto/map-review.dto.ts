import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class MapReviewDto {
  @IsNumber()
  @Transform(transformNumber)
  cupId: number;

  @IsNumber()
  @Transform(transformNumber)
  vote: number;
}
