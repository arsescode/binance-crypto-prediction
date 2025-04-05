export enum ResultStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    NOT_FOUND = 'notFound',
    BAD_REQUEST = 'badRequest',
    UNAUTHORIZED = 'unauthorized',
    FORBIDDEN = 'forbidden',
    SERVER_ERROR = 'serverError'
  }
  
  export class ResultDto<T> {
    status: ResultStatus;
    message: string;
    data?: T;
  
    constructor(status: ResultStatus, message: string, data?: T) {
      this.status = status;
      this.message = message;
      this.data = data;
    }
  
    static success<T>(data: T, message: string = 'Operation successful'): ResultDto<T> {
      return new ResultDto<T>(ResultStatus.SUCCESS, message, data);
    }
  
    static failed(message: string = 'Operation failed'): ResultDto<null> {
      return new ResultDto<null>(ResultStatus.FAILED, message);
    }
  
    static notFound(message: string = 'Resource not found'): ResultDto<null> {
      return new ResultDto<null>(ResultStatus.NOT_FOUND, message);
    }
  
    static badRequest(message: string = 'Bad request'): ResultDto<null> {
      return new ResultDto<null>(ResultStatus.BAD_REQUEST, message);
    }
  
    static serverError(message: string = 'Internal server error'): ResultDto<null> {
      return new ResultDto<null>(ResultStatus.SERVER_ERROR, message);
    }
  }