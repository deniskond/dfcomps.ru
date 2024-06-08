import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isDefined, isEnum } from 'class-validator';

@Injectable()
export class EnumValidationPipe implements PipeTransform<unknown, unknown> {
  constructor(private enumEntity: any) {}

  transform(value: unknown): unknown {
    if (isDefined(value) && isEnum(value, this.enumEntity)) {
      return value;
    } else {
      const errorMessage = `the value ${value} is not valid. See the acceptable values: ${Object.keys(
        this.enumEntity,
      ).map((key) => this.enumEntity[key])}`;

      throw new BadRequestException(errorMessage);
    }
  }
}
