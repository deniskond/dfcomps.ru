import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { RoundResultEntryInterface } from './round-result-entry.interface';

export class SaveOnlineCupRoundDto {
  @IsNotEmpty()
  cupId: number;

  @IsNotEmpty()
  roundNumber: 1 | 2 | 3 | 4 | 5;

  @IsNotEmpty()
  @Transform(({ value }) => JSON.parse(value))
  roundResults: RoundResultEntryInterface[];
}
