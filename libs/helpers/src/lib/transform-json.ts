import { TransformFnParams } from 'class-transformer';

export function transformJSON<T>({ value }: TransformFnParams) {
  return JSON.parse(value) as T;
}
