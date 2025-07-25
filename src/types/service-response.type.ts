export interface BaseResponse {
  isSuccess: boolean;
  message: string;
}

export interface DataResponse<T> extends BaseResponse {
  data?: T | null;
}

export interface DataListResponse<T> extends BaseResponse {
  dataCount: number;
  data: T[];
}
