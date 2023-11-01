import { IsNotEmpty } from 'class-validator';

export class ProfileUpdateDto {
  @IsNotEmpty()
  nick: string;

  country: string | undefined;
}
