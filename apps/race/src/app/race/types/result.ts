export type ErrorCode = 'NotFound' | 'BadRequest' | 'DuplicateKey' | 'NotAllowed';

export interface ErrorMessage {
  code: ErrorCode;
  message: string;
}

export type Result<Type> = { err: ErrorMessage; result: undefined } | { err: undefined; result: Type };
export type AsyncResult<Type> = Promise<Result<Type>>;

export const badRequest = (message: string): Result<never> => ({
  err: { code: 'BadRequest', message: message },
  result: undefined,
});
export const notAllowed = (message: string): Result<never> => ({
  err: { code: 'NotAllowed', message: message },
  result: undefined,
});
export const notFound = (message: string): Result<never> => ({
  err: { code: 'NotFound', message: message },
  result: undefined,
});
export const duplicate = (message: string): Result<never> => ({
  err: { code: 'DuplicateKey', message: message },
  result: undefined,
});
export const error = (err: ErrorMessage): Result<never> => ({ err, result: undefined });
export const result = <Type>(result: Type): Result<Type> => ({ result, err: undefined });
