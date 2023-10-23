import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ValidationResultInterface } from './validation-result.interface';

export class ProcessValidationDto {
  @IsNotEmpty()
  @Transform(({ value }) => JSON.parse(value))
  validationResults: ValidationResultInterface[];

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  allDemosCount: number;
}
