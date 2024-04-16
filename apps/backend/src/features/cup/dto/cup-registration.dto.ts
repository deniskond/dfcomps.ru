import { IsNotEmpty } from 'class-validator';

export class CupRegistrationDto {
  @IsNotEmpty()
  cupId: number;
}
