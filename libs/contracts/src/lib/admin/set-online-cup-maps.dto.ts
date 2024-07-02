import { transformJSON, transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetOnlineCupMapsDto {
  @IsNumber()
  @Transform(transformNumber)
  cupId: number;

  @IsNotEmpty()
  @Transform(transformJSON<(string | null)[]>)
  maps: (string | null)[];
}
