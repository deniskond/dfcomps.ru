import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class SetOnlineCupMapsDto {
  @IsNotEmpty()
  cupId: number;

  @IsNotEmpty()
  @Transform(({ value }) => JSON.parse(value))
  maps: (string | null)[];
}
