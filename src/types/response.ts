export interface ApiResponse<T, U>  {
  code: number;
  success: boolean;
  data: T;
  message: string;
  error: string | null | Error;
  meta?: U;
};

export type ErrorResponse = ApiResponse<null, null>;

export default ApiResponse;
