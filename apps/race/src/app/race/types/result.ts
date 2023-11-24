export type ErrorCode = 'NotFound' | 'BadRequest' | 'DuplicateKey' | 'NotAllowed' | 'InternalError';

export interface ErrorMessage {
  code: ErrorCode;
  message: string;
}

export type ErrorType = { err: ErrorMessage; result: undefined };
export type ResultType<Type> = { err: undefined; result: Type };
export type Result<Type> = ErrorType | ResultType<Type>;
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

export function isErrorResult(x: any): x is ErrorType {
  return x instanceof Object && "err" in x && x.err instanceof Object && typeof x.err.code === 'string' && typeof x.err.message === 'string';
}
export function isAnyResult(x: any): x is ResultType<any> {
  return x instanceof Object && "result" in x && x.result !== undefined;
}

export function isResult(x: any): x is Result<any> {
  return isErrorResult(x) || isAnyResult(x);
}
