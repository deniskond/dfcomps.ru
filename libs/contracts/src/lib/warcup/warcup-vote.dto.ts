import { IsNotEmpty, IsNumber } from 'class-validator';

export class WarcupVoteDto {
  @IsNumber()
  @IsNotEmpty()
  mapSuggestionId: number;
}
