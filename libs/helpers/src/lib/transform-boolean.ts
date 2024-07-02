import { TransformFnParams } from 'class-transformer';

export function transformBoolean({ value }: TransformFnParams): boolean {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return value;
  }
}
