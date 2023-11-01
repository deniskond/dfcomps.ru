import { IsNotEmpty } from 'class-validator';

export class FinishMatchDto {
  @IsNotEmpty()
  firstPlayerId: number;

  @IsNotEmpty()
  secondPlayerId: number;
}
