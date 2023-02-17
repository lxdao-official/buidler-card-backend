export class Response<T> {
  status: string;
  status_code: number;
  timestamp: string;
  request_path: string;
  request_id: string;
  message: string;
  dev_message: string;
  error_code: string;
  data: T;
  pagination?: {
    current: number;
    per_page: number;
    total: number;
  };
}
export class ResponseData<T> {
  message?: string;
  dev_message?: string;
  data: T;
  pagination?: {
    current: number;
    per_page: number;
    total: number;
  };
}
