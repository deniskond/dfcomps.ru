import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetPlayerServerDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  onlineCupId: number;

  @IsNumber()
  @IsNotEmpty()
  serverNumber: number;
}
