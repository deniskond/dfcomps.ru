import { IsNotEmpty } from 'class-validator';

export class CheckCupRegistrationDto {
  @IsNotEmpty()
  cupId: number;
}
