export interface BaseResponse {
  isSuccess: boolean;
  message: string;
}

export interface ErrorResponse {
  code: string;
  details: string;
}

export interface DataResponse<T> extends BaseResponse {
  data: T | null;
  error?: ErrorResponse | null;
}

export interface DataListResponse<T> extends BaseResponse {
  dataCount: number;
  data: T[];
  error?: ErrorResponse | null;
}
