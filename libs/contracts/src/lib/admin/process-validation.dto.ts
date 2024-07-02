import { IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ValidationResultInterface } from './validation-result.interface';
import { transformJSON, transformNumber } from '@dfcomps/helpers';

export class ProcessValidationDto {
  @IsNotEmpty()
  @Transform(transformJSON<ValidationResultInterface[]>)
  validationResults: ValidationResultInterface[];

  @IsNumber()
  @Transform(transformNumber)
  allDemosCount: number;
}
