import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { RoundResultEntryInterface } from './round-result-entry.interface';

export class SaveOnlineCupRoundDto {
  @IsNotEmpty()
  cupId: number;

  @IsNotEmpty()
  roundNumber: number;

  @IsNotEmpty()
  @Transform(({ value }) => JSON.parse(value))
  roundResults: RoundResultEntryInterface[];
}
