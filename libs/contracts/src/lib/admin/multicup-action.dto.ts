import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MulticupActionDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Transform(transformNumber)
  rounds: number;
}
