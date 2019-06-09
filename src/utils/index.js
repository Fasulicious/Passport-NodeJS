export class AppError {
  constructor(code, message = false){
    Error.call(this);
    Error.captureStackTrace(this);
    this.code = code;
    this.message = message;
  }
}