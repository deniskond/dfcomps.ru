import { IsNotEmpty } from 'class-validator';

export class GetPasswordTokenDto {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  password: string;
}
