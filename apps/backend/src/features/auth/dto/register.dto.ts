import { IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  discordAccessToken: string;
}
