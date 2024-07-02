import { TransformFnParams } from 'class-transformer';

export function transformNumber({ value }: TransformFnParams): number {
  return Number(value);
}
