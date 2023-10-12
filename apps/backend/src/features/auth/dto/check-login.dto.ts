import { IsNotEmpty } from 'class-validator';

export class CheckLoginDto {
  @IsNotEmpty()
  login: string;
}
