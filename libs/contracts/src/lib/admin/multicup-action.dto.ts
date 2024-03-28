import { IsNotEmpty } from 'class-validator';

export class MulticupActionDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  rounds: number;
}
