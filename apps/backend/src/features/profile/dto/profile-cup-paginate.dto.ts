import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformNumber } from '@dfcomps/helpers';

export class ProfileCupPaginateDto {
  @IsNumber()
  @Transform(transformNumber)
  userId: number;

  @IsNumber()
  @Transform(transformNumber)
  offset: number;

  @IsNumber()
  @Transform(transformNumber)
  limit: number;
}
