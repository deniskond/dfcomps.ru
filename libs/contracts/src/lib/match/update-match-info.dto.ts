import { IsNotEmpty } from 'class-validator';

export class UpdateMatchInfoDto {
  @IsNotEmpty()
  firstPlayerId: number;

  @IsNotEmpty()
  secondPlayerId: number;

  @IsNotEmpty()
  map: string;
}
