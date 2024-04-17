import { IsNotEmpty, IsNumber } from 'class-validator';

export class ParseServerLogsDto {
  @IsNumber()
  @IsNotEmpty()
  cupId: number;
}
