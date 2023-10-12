import { IsNotEmpty } from 'class-validator';

export class GetDiscordTokenDto {
  @IsNotEmpty()
  discordAccessToken: string;
}
