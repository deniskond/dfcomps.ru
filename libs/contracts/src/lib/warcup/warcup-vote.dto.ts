import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class WarcupVoteDto {
  @IsNumber()
  @Transform(transformNumber)
  mapSuggestionId: number;
}
