import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { RoundResultEntryInterface } from './round-result-entry.interface';
import { transformJSON, transformNumber } from '@dfcomps/helpers';

export class SaveOnlineCupRoundDto {
  @IsNumber()
  @Transform(transformNumber)
  cupId: number;

  @IsNotEmpty()
  @Transform(transformNumber)
  roundNumber: 1 | 2 | 3 | 4 | 5;

  @IsNotEmpty()
  @Transform(transformJSON<RoundResultEntryInterface[]>)
  roundResults: RoundResultEntryInterface[];
}
