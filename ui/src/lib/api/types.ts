export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'RATE_LIMITED'
  | 'INTERNAL'
  | 'UNKNOWN';

export interface ApiErrorShape {
  code: ApiErrorCode;
  error: string;
  message?: string;
  type?: string;
  fallbackRoute?: string;
}

export interface ApiResponseSuccess<T> {
  ok: true;
  data: T;
  trace_id?: string;
}

export interface ApiResponseError {
  ok: false;
  error: ApiErrorShape;
  trace_id?: string;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  status: LoadStatus;
  data?: T;
  error?: ApiErrorShape;
}


